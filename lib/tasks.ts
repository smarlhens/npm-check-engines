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
import { CheckCommandContext, PackageJSONSchema, PackageLockJSONSchema } from './types';
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

export const computeEnginesConstraints: CheckCommandTask = ({ ctx, debug }): void => {
  const { packageLockObject } = ctx;

  if (!packageLockObject) {
    throw new Error(`${packageLockJSONFilename} data is not defined.`);
  }

  if (!('packages' in packageLockObject)) {
    throw new Error(`${packageLockJSONFilename} does not contain packages property.`);
  }

  const ignoredRanges: string[] = [];
  let mrr: Range | undefined;

  for (const [pkgName, pkg] of Object.entries(packageLockObject.packages)) {
    let constraint: string | undefined;
    const { engines } = pkg;

    if (typeof engines === 'object' && 'node' in engines) {
      constraint = engines.node;
    } else if (isArray(engines) && engines.some(constraint => constraint.includes('node'))) {
      constraint = engines.find(constraint => constraint.includes('node'))?.replace('node', '');
    }

    if (!constraint) {
      debug(`${white('Package')} ${gray(pkgName)} ${white('has no constraints for node engines')}`);
      continue;
    }

    const rawValidRange = semverValidRange(constraint);
    if (!rawValidRange) {
      debug(`${red(constraint)} ${white('is not a valid semver range')}`);
      continue;
    }

    if (ignoredRanges.indexOf(rawValidRange) !== -1) {
      debug(`${white('Ignored range:')} ${gray(rawValidRange)}`);
      continue;
    }

    const range = new Range(rawValidRange, rangeOptions);

    if (!mrr) {
      mrr = range;
      debug(`${white('New most restrictive range:')} ${green(mrr.raw)}`);
      continue;
    }

    const newRestrictiveRange = restrictiveRange(mrr, range, ignoredRanges, debug);
    if (mrr.raw !== newRestrictiveRange.raw) {
      mrr = newRestrictiveRange;
      debug(`${white('New most restrictive range:')} ${green(mrr.raw)}`);
    }
  }

  if (!mrr) {
    throw new Error('Computed node engines range constraint is not defined.');
  }

  debug(`${white(`Final computed node engines range:`)} ${blue(mrr.raw)}`);
  ctx.mostRestrictiveRange = mrr;
};

export const outputComputedConstraints: CheckCommandTask = ({ ctx, parent, debug }): void => {
  const { mostRestrictiveRange } = ctx;

  const simplifiedRange = humanizeRange(mostRestrictiveRange);

  if (!simplifiedRange) {
    throw new Error('Simplified node engines range constraint is not defined.');
  }

  parent.title = `Computed node engines range: ${simplifiedRange}`;
  debug(`${white(`Simplified computed node engines range:`)} ${blue(simplifiedRange)}`);
  ctx.simplifiedComputedRange = simplifiedRange;
};

export const updatePackageJson: CheckCommandTask = async ({ ctx, debug }): Promise<void> => {
  const { simplifiedComputedRange } = ctx;

  if (!simplifiedComputedRange) {
    throw new Error('Simplified computed node engines range constraint is not defined.');
  }

  const { path, workingDir } = ctx;
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

  packageJSON.engines = merge({}, packageJSON.engines, { node: simplifiedComputedRange });

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
    title: 'Compute node engines constraints...',
    task: (ctx, task) => computeEnginesConstraints({ ctx, task, parent, debug }),
  },
  {
    title: 'Output computed node engines constraints...',
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
        title: 'Checking npm package node engines constraints in package-lock.json file...',
        task: (ctx, task) => {
          const { path, workingDir } = ctx;
          const completePath = joinPath(workingDir, path, packageLockJSONFilename);
          task.title = `Checking npm package node engines constraints in ${completePath.replace(
            `${workingDir}${sep}`,
            '',
          )} file...`;
          return task.newListr(parent => checkCommandTasks(parent, debug));
        },
      },
    ],
    options,
  );
