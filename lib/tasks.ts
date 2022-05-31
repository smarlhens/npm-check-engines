import {
  Listr,
  ListrBaseClassOptions,
  ListrRenderer,
  ListrRendererFactory,
  ListrRendererValue,
  ListrTask,
  ListrTaskResult,
  ListrTaskWrapper,
} from 'listr2';
import {
  CheckCommandContext,
  EngineConstraintKey,
  EngineConstraintKeys,
  LockPackage,
  LockPackageEngines,
  LockPackageEnginesObject,
  PackageJSONSchema,
  PackageLockJSONSchema,
} from './types';
import { getJson, joinPath, getRelativePath } from './utils';
import { validatePackageJSONFn, validatePackageLockJSONFn } from './json-schema-validator';
import { isArray, merge } from 'lodash';
import Comparator from 'semver/classes/comparator';
import compare from 'semver/functions/compare';
import Range from 'semver/classes/range';
import semverValidRange from 'semver/ranges/valid';
import rangeSubset from 'semver/ranges/subset';
import { writeJson } from 'fs-extra';
import sortPackageJson from 'sort-package-json';
import { blue, gray, green, red, white, yellow } from 'colorette';
import { Debugger } from 'debug';
import { eq, gte, minVersion, Options, SemVer } from 'semver';
import { sep } from 'path';

export type Task<Ctx, Renderer extends ListrRendererFactory = any> = (args: {
  ctx: Ctx;
  task: ListrTaskWrapper<Ctx, Renderer>;
  parent: Omit<ListrTaskWrapper<Ctx, Renderer>, 'skip' | 'enabled'>;
  debug: Debugger;
}) => void | ListrTaskResult<Ctx>;
export type CheckCommandTask = Task<CheckCommandContext>;

export const rangeOptions: Options = { loose: false, includePrerelease: false };
const packageJSONFilename = 'package.json' as const;
const packageLockJSONFilename = 'package-lock.json' as const;

export const sortRangeSet = (set: ReadonlyArray<ReadonlyArray<Comparator>>): Comparator[][] =>
  [...set.map(comp => [...comp])].sort((a, b) => compare(a[0].semver, b[0].semver));

export const setToRange = (set: Comparator[][]): Range =>
  new Range(set.map(tuple => tuple.map(comp => comp.value).join(' ')).join('||'), rangeOptions);

export const applyMinVersionToRangeSet = (
  set: ReadonlyArray<ReadonlyArray<Comparator>>,
  minVersion: SemVer,
): Comparator[][] =>
  [...set.map(comp => [...comp])]
    .filter(c => c[0].semver.major >= minVersion.major)
    .map(c => {
      if (c[0].semver.major === minVersion.major && gte(minVersion, c[0].semver, rangeOptions)) {
        c[0] = new Comparator(`${c[0].operator}${minVersion.raw}`);
      }

      return c;
    });

export const restrictiveRange = (r1: Range, r2: Range, ignoredRanges: string[], debug: Debugger): Range => {
  debug(`${white('Compare:')} ${blue(r1.raw)} ${white('and')} ${blue(r2.raw)}`);

  if (rangeSubset(r1, r2)) {
    debug(`${white('Range')} ${green(r1.raw)} ${white('is a subset of')} ${blue(r2.raw)}`);
    ignoredRanges.push(r2.raw);
    return r1;
  } else if (rangeSubset(r2, r1)) {
    debug(`${white('Range')} ${green(r2.raw)} ${white('is a subset of')} ${blue(r1.raw)}`);
    ignoredRanges.push(r1.raw);
    return r2;
  }

  const minVersion1 = minVersion(r1, rangeOptions) || new SemVer('*');
  const minVersion2 = minVersion(r2, rangeOptions) || new SemVer('*');
  const sortedR1: Comparator[][] = sortRangeSet(r1.set);
  const sortedR2: Comparator[][] = sortRangeSet(r2.set);

  if (!eq(minVersion1, minVersion2, rangeOptions)) {
    const minSemver = compare(minVersion1, minVersion2) === -1 ? minVersion2 : minVersion1;
    debug(`${white('Applying minimal version')} ${yellow(minSemver.version)} ${white('to both ranges.')}`);

    const newR1 = setToRange(applyMinVersionToRangeSet(sortedR1, minSemver));
    const newR2 = setToRange(applyMinVersionToRangeSet(sortedR2, minSemver));

    if (newR1.intersects(newR2, rangeOptions)) {
      return restrictiveRange(newR1, newR2, ignoredRanges, debug);
    } else {
      throw new Error('Not yet implemented :/');
    }
  }

  const minComp1: Comparator[] | undefined = sortedR1.shift();
  const minComp2: Comparator[] | undefined = sortedR2.shift();
  const minComp: Comparator[] | undefined = minComp1 || minComp2;

  if (!minComp) {
    throw new Error('Not yet implemented :/');
  }

  const set: Comparator[][] = [minComp];
  const newR1 = setToRange(sortedR1);
  const newR2 = setToRange(sortedR2);
  const newRange = restrictiveRange(newR1, newR2, ignoredRanges, debug);
  set.push(...sortRangeSet(newRange.set));
  return setToRange(set);
};

export const humanizeRange = (range?: Range): string | undefined => {
  if (!range) {
    return;
  }

  const res: string[] = [];

  const set = sortRangeSet(range.set);

  set.forEach(comps => {
    const [from, to] = comps;
    if (
      comps.length === 2 &&
      from.operator === '>=' &&
      to.operator === '<' &&
      from.semver.major + 1 === to.semver.major
    ) {
      res.push(`^${from.semver.version}`);
    } else if (comps.length === 1 && from.operator === '>=') {
      res.push(from.value);
    } else {
      res.push(`${from.value} ${to?.value || ''}`.trim());
    }
  });

  return res.join(' || ');
};

export const loadLockFile: CheckCommandTask = async ({ ctx }): Promise<void> => {
  const { path, workingDir } = ctx;
  const pathToFile = joinPath(path || '', packageLockJSONFilename);
  const relativePath = getRelativePath({ path: pathToFile, workingDir });
  const packageLockJSON: PackageLockJSONSchema | undefined = await getJson<PackageLockJSONSchema>(relativePath).catch(
    () => undefined,
  );

  if (!packageLockJSON) {
    throw new Error(`${relativePath} is not defined.`);
  }

  const packageLockData = validatePackageLockJSONFn(packageLockJSON);

  if (!packageLockData) {
    throw new Error(validatePackageLockJSONFn.errors?.map(e => e.message).join('\n'));
  }

  ctx.packageLockObject = packageLockJSON;
};

export const getConstraintFromEngines = (
  engines: LockPackageEngines,
  constraintKey: EngineConstraintKey,
): string | undefined => {
  if (typeof engines === 'object' && constraintKey in engines) {
    return (engines as LockPackageEnginesObject)[constraintKey];
  } else if (isArray(engines) && engines.some(constraint => constraint.includes(constraintKey))) {
    return engines.find(constraint => constraint.includes(constraintKey))?.replace(constraintKey, '');
  }

  return undefined;
};

export const computeEnginesConstraint = ({
  packages,
  constraintKey,
  debug,
}: {
  packages: [string, LockPackage][];
  constraintKey: EngineConstraintKey;
  debug: Debugger;
}): Range | undefined | never => {
  let mrr: Range | undefined;
  const ignoredRanges: string[] = [];
  const debugConstraint = debug.extend(constraintKey);

  for (const [pkgName, pkg] of packages) {
    const { engines } = pkg;
    let constraint: string | undefined = getConstraintFromEngines(engines, constraintKey);

    if (!constraint) {
      debugConstraint(`${white('Package')} ${gray(pkgName)} ${white('has no constraints for current engine')}`);
      continue;
    }

    const rawValidRange = semverValidRange(constraint);
    if (!rawValidRange) {
      debugConstraint(`${red(constraint)} ${white('is not a valid semver range')}`);
      continue;
    }

    if (ignoredRanges.indexOf(rawValidRange) !== -1) {
      debugConstraint(`${white('Ignored range:')} ${gray(rawValidRange)}`);
      continue;
    }

    const range = new Range(rawValidRange, rangeOptions);

    if (!mrr) {
      mrr = range;
      debugConstraint(`${white('New most restrictive range:')} ${green(mrr.raw)}`);
      continue;
    }

    const newRestrictiveRange = restrictiveRange(mrr, range, ignoredRanges, debugConstraint);
    if (mrr.raw !== newRestrictiveRange.raw) {
      mrr = newRestrictiveRange;
      debugConstraint(`${white('New most restrictive range:')} ${green(mrr.raw)}`);
    }
  }

  if (mrr) {
    debugConstraint(`${white(`Final computed engine range constraint:`)} ${blue(mrr.raw)}`);
  } else {
    debugConstraint(`${white(`No computed engine range constraint`)}`);
  }

  return mrr;
};

export const computeEnginesConstraints: CheckCommandTask = ({ ctx, debug }): void => {
  const { packageLockObject, engines } = ctx;

  if (!packageLockObject) {
    throw new Error(`${packageLockJSONFilename} data is not defined.`);
  }

  if (!('packages' in packageLockObject)) {
    throw new Error(`${packageLockJSONFilename} does not contain packages property.`);
  }

  const filterEngineConstraintKey = (key: string): key is EngineConstraintKey =>
    -1 !== EngineConstraintKeys.indexOf(key as EngineConstraintKey);
  const packages = Object.entries(packageLockObject.packages);
  const ranges = new Map<EngineConstraintKey, Range | undefined>();
  const constraintKeys: EngineConstraintKey[] = engines?.filter(filterEngineConstraintKey) || [...EngineConstraintKeys];

  if (0 === constraintKeys.length) {
    throw new Error(`No valid constraint key(s).`);
  }

  for (const constraintKey of constraintKeys) {
    ranges.set(constraintKey, computeEnginesConstraint({ packages, constraintKey, debug }));
  }

  ctx.ranges = ranges;
};

export const outputComputedConstraints: CheckCommandTask = ({ ctx, parent, debug }): void => {
  const { ranges } = ctx;

  if (!ranges) {
    throw new Error(`Computed engines range constraints are not defined.`);
  }

  const rangesSimplified = new Map<EngineConstraintKey, string | undefined>();
  let title: string = `Computed engines range constraints:`;
  for (const [key, range] of ranges.entries()) {
    const rangeHumanized = humanizeRange(range);
    if (!rangeHumanized) {
      continue;
    }

    rangesSimplified.set(key, rangeHumanized);
    debug.extend(key)(`${white(`Simplified computed engine range constraint:`)} ${blue(rangeHumanized)}`);
    title += `\n${!ctx.debug ? '  ' : ''}- ${yellow(key)}: ${blue(rangeHumanized)}`;
  }

  if (0 === rangesSimplified.size) {
    throw new Error('Simplified engines range constraints are not defined.');
  }

  parent.title = title;
  ctx.rangesSimplified = rangesSimplified;
};

export const updatePackageJson: CheckCommandTask = async ({ ctx, debug }): Promise<void> => {
  const { path, workingDir, rangesSimplified } = ctx;

  if (!rangesSimplified) {
    throw new Error(`Simplified computed engines range constraints are not defined.`);
  }

  const pathToFile = joinPath(path, packageJSONFilename);
  const relativePath = getRelativePath({ path: pathToFile, workingDir });
  debug(`${white(`Relative path to ${packageJSONFilename}:`)} ${blue(relativePath)}`);

  const packageJSON: PackageJSONSchema | undefined = await getJson<PackageJSONSchema>(relativePath).catch(
    () => undefined,
  );

  if (!packageJSON) {
    throw new Error(`${relativePath} is not defined.`);
  }

  debug(`${white(`Validate JSON schema of`)} ${blue(relativePath)}`);
  let packageLockData = validatePackageJSONFn(packageJSON);

  if (!packageLockData) {
    throw new Error(validatePackageJSONFn.errors?.map(e => e.message).join('\n'));
  }

  packageJSON.engines = merge({}, packageJSON.engines, Object.fromEntries(rangesSimplified));

  debug(`${white(`Write JSON to`)} ${blue(relativePath)}`);
  return writeJson(relativePath, sortPackageJson(packageJSON), { encoding: 'utf8', replacer: null, spaces: 2 });
};

export const checkCommandTasks = (
  parent: Omit<ListrTaskWrapper<CheckCommandContext, typeof ListrRenderer>, 'skip' | 'enabled'>,
  debug: Debugger,
): ListrTask<CheckCommandContext>[] => [
  {
    title: `Load ${packageLockJSONFilename} file...`,
    task: (ctx, task) => loadLockFile({ ctx, task, parent, debug }),
  },
  {
    title: 'Compute engines range constraints...',
    task: (ctx, task) => computeEnginesConstraints({ ctx, task, parent, debug }),
  },
  {
    title: 'Output computed engines range constraints...',
    task: (ctx, task) => outputComputedConstraints({ ctx, task, parent, debug }),
  },
  {
    title: `Update ${packageJSONFilename} file...`,
    skip: ({ update }) => (!update ? 'Update is disabled by default.' : !update),
    task: (ctx, task) => updatePackageJson({ ctx, task, parent, debug }),
  },
];

export const cliCommandTask = (
  options: ListrBaseClassOptions<CheckCommandContext, ListrRendererValue>,
  debug: Debugger,
): Listr<CheckCommandContext, ListrRendererValue> =>
  new Listr(
    [
      {
        title: 'Checking npm package engines range constraints in package-lock.json file...',
        task: (ctx, task) => {
          const { path, workingDir } = ctx;
          const completePath = joinPath(workingDir, path, packageLockJSONFilename);
          task.title = `Checking npm package engines range constraints in ${completePath.replace(
            `${workingDir}${sep}`,
            '',
          )} file...`;
          return task.newListr(parent => checkCommandTasks(parent, debug));
        },
      },
    ],
    options,
  );
