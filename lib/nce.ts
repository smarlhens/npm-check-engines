import Ajv, { type JSONSchemaType } from 'ajv';
import chalk from 'chalk';
import Table from 'cli-table';
import Debug, { type Debugger } from 'debug';
import {
  Listr,
  type ListrBaseClassOptions,
  type ListrRenderer,
  type ListrRendererOptions,
  type ListrRendererValue,
  type ListrTask,
  type ListrTaskWrapper,
} from 'listr2';
import { isArray, merge } from 'lodash-es';
import fs from 'node:fs/promises';
import { join, normalize } from 'node:path';
import * as semver from 'semver';
import sortPackageJson from 'sort-package-json';

import type { CLIArgs } from './yargs.js';

const EngineConstraintKeys = ['node', 'npm', 'yarn'] as const;
type EngineConstraintKeysType = typeof EngineConstraintKeys;
type EngineConstraintKey = EngineConstraintKeysType[number];
type LockPackageEnginesObject = Partial<Record<EngineConstraintKey, string>>;
type LockPackageEnginesArray = string[];
type LockPackageEngines = LockPackageEnginesObject | LockPackageEnginesArray;

type OptionalEngines = {
  engines?: LockPackageEngines;
};

type PackageDependencies = { [dependencyName: string]: OptionalEngines };
type PackageLockDependencies = { dependencies: PackageDependencies };
type PackageLockPackages = { packages: PackageDependencies };

type PackageLockVersion1 = {
  lockfileVersion: 1;
} & PackageLockDependencies;

type PackageLockVersion2 = {
  lockfileVersion: 2;
} & Partial<PackageLockPackages> &
  PackageLockDependencies;

type PackageLockVersion3 = {
  lockfileVersion: 3;
} & PackageLockPackages;

type PackageLock = PackageLockVersion1 | PackageLockVersion2 | PackageLockVersion3;

type EngineRangeToSet = {
  engine: EngineConstraintKey;
  range: string;
  rangeToSet: string;
};

export type CheckEnginesInput = {
  engines?: EngineConstraintKey[] | undefined;
  packageLockString: string;
  packageJsonString: string;
};

export type CheckEnginesOutput = {
  packageJson: OptionalEngines;
  packageLock: PackageLock;
  enginesRangeToSet: EngineRangeToSet[];
};

export type CheckEnginesContext = CheckEnginesInput & Partial<CheckEnginesOutput>;

type Options = {
  engines: EngineConstraintKey[];
  workingDir: string;
  update: boolean;
  verbose: boolean;
  quiet: boolean;
  debug: boolean;
  enableEngineStrict: boolean;
  packageLockPath: string;
  packageJsonPath: string;
};

const packageLockFilename = 'package-lock.json' as const;
const packageJsonFilename = 'package.json' as const;
const debugNamespace: string = 'nce' as const;
const debug: Debugger = Debug(debugNamespace);
const namespaces = () => Debug.disable();
const enableNamespaces = (namespaces: string): void => Debug.enable(namespaces);

const renderer = (
  { debug, quiet, verbose }: { debug?: boolean; quiet?: boolean; verbose?: boolean },
  env = process.env,
): ListrRendererOptions<ListrRendererValue, ListrRendererValue> => {
  if (quiet) {
    return { renderer: 'silent' };
  }

  if (verbose) {
    return { renderer: 'verbose' };
  }

  const isDumbTerminal = env.TERM === 'dumb';
  if (debug || isDumbTerminal) {
    return { renderer: 'simple' };
  }

  if (env.NODE_ENV === 'test') {
    return { renderer: 'test' };
  }

  return { renderer: 'default', rendererOptions: { dateFormat: false } };
};

export const checkEnginesFromCLI = async (args: CLIArgs): Promise<CheckEnginesContext> => {
  const cliArgs = args;
  const isValidConstraintEngine = (value: string): value is EngineConstraintKey =>
    EngineConstraintKeys.includes(value as EngineConstraintKey);

  let options: Options = {
    workingDir: normalize(process.cwd()),
    update: cliArgs.update || false,
    verbose: cliArgs.verbose || false,
    quiet: cliArgs.quiet || false,
    debug: cliArgs.debug || false,
    engines: cliArgs.engines?.filter(isValidConstraintEngine) || [],
    enableEngineStrict: cliArgs.enableEngineStrict || false,
    packageLockPath: join(process.cwd(), packageLockFilename),
    packageJsonPath: join(process.cwd(), packageJsonFilename),
  };

  const context = {
    ...renderer({ quiet: options.quiet, debug: options.debug, verbose: options.verbose }),
  };

  const debugNamespaces = namespaces();
  if (options.debug) {
    enableNamespaces(debugNamespaces);
  }

  return checkEnginesCommand({
    options,
    context,
  }).run();
};

// @ts-ignore https://github.com/ajv-validator/ajv/issues/2132
const ajv = new Ajv();

// @ts-ignore
const optionalEnginesSchema: JSONSchemaType<OptionalEngines> = {
  type: 'object',
  properties: {
    engines: {
      anyOf: [
        {
          type: 'object',
          additionalProperties: { type: 'string' },
          oneOf: [
            {
              required: ['node'],
            },
            {
              required: ['npm'],
            },
            {
              required: ['yarn'],
            },
          ],
        },
        {
          type: 'array',
          items: { type: 'string' },
        },
        {
          type: 'object',
          not: { required: ['engines'] },
        },
      ],
    },
  },
};

// @ts-ignore
const packageLockSchema: JSONSchemaType<PackageLock> = {
  type: 'object',
  properties: {
    lockfileVersion: { type: 'number', enum: [1, 2, 3] },
    dependencies: {
      type: 'object',
      patternProperties: {
        '^.*$': optionalEnginesSchema,
      },
    },
    packages: {
      type: 'object',
      patternProperties: {
        '^.*$': optionalEnginesSchema,
      },
    },
  },
  required: ['lockfileVersion'],
  oneOf: [
    {
      properties: { lockfileVersion: { const: 1 } },
      required: ['dependencies'],
      not: { required: ['packages'] },
    },
    {
      properties: { lockfileVersion: { const: 2 } },
      required: ['dependencies'],
    },
    {
      properties: { lockfileVersion: { const: 3 } },
      required: ['packages'],
      not: { required: ['dependencies'] },
    },
  ],
};

export const rangeOptions: semver.Options = { loose: false };

export const sortRangeSet = (set: ReadonlyArray<ReadonlyArray<semver.Comparator>>): semver.Comparator[][] =>
  [...set.map(comp => [...comp])].sort((a, b) => semver.compare(a[0].semver, b[0].semver));

export const setToRange = (set: semver.Comparator[][]): semver.Range =>
  new semver.Range(set.map(tuple => tuple.map(comp => comp.value).join(' ')).join('||'), rangeOptions);

export const applyMinVersionToRangeSet = (
  set: ReadonlyArray<ReadonlyArray<semver.Comparator>>,
  minVersion: semver.SemVer,
): semver.Comparator[][] =>
  [...set.map(comp => [...comp])]
    .filter(c => c[0].semver.major >= minVersion.major)
    .map(c => {
      if (c[0].semver.major === minVersion.major && semver.gte(minVersion, c[0].semver, rangeOptions)) {
        c[0] = new semver.Comparator(`${c[0].operator}${minVersion.raw}`);
      }

      return c;
    });

export const restrictiveRange = (
  r1: semver.Range,
  r2: semver.Range,
  ignoredRanges: string[],
  debug: (str: string) => void,
): semver.Range => {
  debug(`${chalk.white('Compare:')} ${chalk.blue(r1.raw)} ${chalk.white('and')} ${chalk.blue(r2.raw)}`);

  if (semver.subset(r1, r2)) {
    debug(`${chalk.white('Range')} ${chalk.green(r1.raw)} ${chalk.white('is a subset of')} ${chalk.blue(r2.raw)}`);
    ignoredRanges.push(r2.raw);
    return r1;
  } else if (semver.subset(r2, r1)) {
    debug(`${chalk.white('Range')} ${chalk.green(r2.raw)} ${chalk.white('is a subset of')} ${chalk.blue(r1.raw)}`);
    ignoredRanges.push(r1.raw);
    return r2;
  }

  if (!r1.intersects(r2, rangeOptions)) {
    debug(
      `${chalk.red('No intersection')} ${chalk.white('between')} ${chalk.blue(r1.raw)} ${chalk.white(
        'and',
      )} ${chalk.blue(r2.raw)}, ${chalk.white('returning')} ${chalk.green(r1.raw)}`,
    );
    return r1;
  } else if (!r2.intersects(r1, rangeOptions)) {
    debug(
      `${chalk.red('No intersection')} ${chalk.white('between')} ${chalk.blue(r2.raw)} ${chalk.white(
        'and',
      )} ${chalk.blue(r1.raw)}, ${chalk.white('returning')} ${chalk.green(r2.raw)}`,
    );
    return r2;
  }

  let minVersion1 = semver.minVersion(r1, rangeOptions) || new semver.SemVer('*');
  let minVersion2 = semver.minVersion(r2, rangeOptions) || new semver.SemVer('*');
  let sortedR1: semver.Comparator[][] = sortRangeSet(r1.set);
  let sortedR2: semver.Comparator[][] = sortRangeSet(r2.set);

  while (minVersion1.major !== minVersion2.major) {
    if (minVersion1.major > minVersion2.major) {
      sortedR2 = sortedR2.slice(1);
    } else {
      sortedR1 = sortedR1.slice(1);
    }

    minVersion1 = semver.minVersion(setToRange(sortedR1), rangeOptions) || new semver.SemVer('*');
    minVersion2 = semver.minVersion(setToRange(sortedR2), rangeOptions) || new semver.SemVer('*');
  }

  if (!semver.eq(minVersion1, minVersion2, rangeOptions)) {
    const minSemver = semver.compare(minVersion1, minVersion2) === -1 ? minVersion2 : minVersion1;
    debug(
      `${chalk.white('Applying minimal version')} ${chalk.yellow(minSemver.version)} ${chalk.white('to both ranges.')}`,
    );

    const newR1 = setToRange(applyMinVersionToRangeSet(sortedR1, minSemver));
    const newR2 = setToRange(applyMinVersionToRangeSet(sortedR2, minSemver));

    if (!newR1.test(minSemver.raw)) {
      debug(
        `${chalk.white('Following range is not valid')}: ${chalk.red(newR1.raw)}, returning ${chalk.green(newR2.raw)}`,
      );
      return newR2;
    }

    if (!newR2.test(minSemver.raw)) {
      debug(
        `${chalk.white('Following range is not valid')}: ${chalk.red(newR2.raw)}, returning ${chalk.green(newR1.raw)}`,
      );
      return newR1;
    }

    if (newR1.intersects(newR2, rangeOptions)) {
      return restrictiveRange(newR1, newR2, ignoredRanges, debug);
    } else if (newR2.intersects(newR1, rangeOptions)) {
      return restrictiveRange(newR2, newR1, ignoredRanges, debug);
    } else {
      debug(
        `${chalk.white('Unable to find intersection range')}: ${chalk.blue(newR1.raw)} and ${chalk.blue(
          newR2.raw,
        )}, returning ${chalk.green(newR1.raw)}`,
      );
      return newR1;
    }
  }

  const minComp1: semver.Comparator[] | undefined = sortedR1.shift();
  const minComp2: semver.Comparator[] | undefined = sortedR2.shift();
  const minComp: semver.Comparator[] | undefined = minComp1 || minComp2;

  if (!minComp) {
    throw new Error('Not yet implemented :/');
  }

  const set: semver.Comparator[][] = [minComp];
  const newR1 = setToRange(sortedR1);
  const newR2 = setToRange(sortedR2);
  const newRange = restrictiveRange(newR1, newR2, ignoredRanges, debug);
  set.push(...sortRangeSet(newRange.set));
  return setToRange(set);
};

export const humanizeRange = (range?: semver.Range): string => {
  if (!range || '*' === range.raw) {
    return '*';
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

const getConstraintFromEngines = (
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

const computeEnginesConstraint = ({
  packages,
  constraintKey,
  debug,
}: {
  packages: PackageDependencies;
  constraintKey: EngineConstraintKey;
  debug: Debugger;
}): semver.Range | never => {
  let mrr: semver.Range = new semver.Range('*');
  const ignoredRanges: string[] = [];
  const debugConstraint = debug.extend(constraintKey);

  for (const [pkgName, pkg] of Object.entries(packages)) {
    const { engines } = pkg;

    if (!engines) {
      debugConstraint(`${chalk.white('Package')} ${chalk.gray(pkgName)} ${chalk.white('has no engines')}`);
      continue;
    }

    let constraint: string | undefined = getConstraintFromEngines(engines, constraintKey);

    if (!constraint) {
      debugConstraint(
        `${chalk.white('Package')} ${chalk.gray(pkgName)} ${chalk.white('has no constraints for current engine')}`,
      );
      continue;
    }

    const rawValidRange = semver.validRange(constraint);
    if (!rawValidRange) {
      debugConstraint(`${chalk.red(constraint)} ${chalk.white('is not a valid semver range')}`);
      continue;
    }

    if (ignoredRanges.indexOf(rawValidRange) !== -1) {
      debugConstraint(`${chalk.white('Ignored range:')} ${chalk.gray(rawValidRange)}`);
      continue;
    }

    const range = new semver.Range(rawValidRange, rangeOptions);

    if (!mrr) {
      mrr = range;
      debugConstraint(`${chalk.white('New most restrictive range:')} ${chalk.green(mrr.raw)}`);
      continue;
    }

    const newRestrictiveRange = restrictiveRange(mrr, range, ignoredRanges, debugConstraint);
    if (mrr.raw !== newRestrictiveRange.raw) {
      mrr = newRestrictiveRange;
      debugConstraint(`${chalk.white('New most restrictive range:')} ${chalk.green(mrr.raw)}`);
    }
  }

  if (mrr) {
    debugConstraint(`${chalk.white(`Final computed engine range constraint:`)} ${chalk.blue(mrr.raw)}`);
  } else {
    debugConstraint(`${chalk.white(`No computed engine range constraint`)}`);
  }

  return mrr;
};

const createOutputTable = (colWidths: number[]): Table => {
  return new Table({
    style: {
      head: [],
      border: [],
      compact: false,
      'padding-left': 1,
      'padding-right': 1,
    },
    colWidths,
    colAligns: ['left', 'left', 'left', 'left'],
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: '',
    },
  });
};

const generateUpdateCommandFromContext = (options: Options): string => {
  const argv: string[] = ['nce'];

  if (options.engines) {
    argv.push(...options.engines.map(e => ['-e', e]).flat());
  }

  if (options.quiet) {
    argv.push('-q');
  }

  if (options.debug) {
    argv.push('-d');
  }

  if (options.verbose) {
    argv.push('-v');
  }

  argv.push('-u');

  return argv.join(' ');
};

export const checkEnginesFromString = (ctx: CheckEnginesInput): CheckEnginesOutput => {
  const packageLock: PackageLock = JSON.parse(ctx.packageLockString);
  const packageJson: OptionalEngines = JSON.parse(ctx.packageJsonString);
  const engines = ctx.engines;
  const enginesRangeToSet: EngineRangeToSet[] = [];

  const filterEngineConstraintKey = (key: string): key is EngineConstraintKey =>
    -1 !== EngineConstraintKeys.indexOf(key as EngineConstraintKey);
  let constraintKeys: EngineConstraintKey[] = [...EngineConstraintKeys];

  if (engines && engines.length > 0) {
    constraintKeys = engines.filter(filterEngineConstraintKey);
  }

  let packages: PackageDependencies;
  if (packageLock.lockfileVersion === 1) {
    packages = packageLock.dependencies;
  } else if (packageLock.lockfileVersion === 2) {
    packages = packageLock.packages ? packageLock.packages : packageLock.dependencies;
  } else if (packageLock.lockfileVersion === 3) {
    packages = packageLock.packages;
  }

  for (const constraintKey of constraintKeys) {
    const from = computeEnginesConstraint({
      packages: { '': { engines: packageJson.engines || {} } },
      constraintKey,
      debug,
    });
    const to = computeEnginesConstraint({
      packages: merge({}, { '': { engines: packageJson.engines || {} } }, packages!),
      constraintKey,
      debug,
    });
    const rangeToHumanized = humanizeRange(to);
    const rangeFromHumanized = humanizeRange(from);

    if (rangeToHumanized === rangeFromHumanized) {
      continue;
    }

    enginesRangeToSet.push({
      engine: constraintKey,
      range: rangeFromHumanized,
      rangeToSet: rangeToHumanized,
    });

    packageJson.engines = merge({}, packageJson.engines, { [constraintKey]: rangeToHumanized });

    if ((packageLock.lockfileVersion === 2 || packageLock.lockfileVersion === 3) && packageLock.packages) {
      packageLock.packages[''].engines = merge({}, packageLock.packages[''].engines, {
        [constraintKey]: rangeToHumanized,
      });
    }
  }

  return {
    packageJson,
    packageLock,
    enginesRangeToSet,
  };
};

export const validatePackageLock = (ctx: Pick<CheckEnginesInput, 'packageLockString'>): boolean => {
  const packageLockValidator = ajv.compile(packageLockSchema);
  const isValid = packageLockValidator(JSON.parse(ctx.packageLockString));
  if (!isValid) {
    throw new Error(`Invalid package-lock.json: ${ajv.errorsText(packageLockValidator.errors)}`);
  }

  return isValid;
};

export const validatePackageJson = (ctx: Pick<CheckEnginesInput, 'packageJsonString'>): boolean => {
  const packageJsonValidator = ajv.compile(optionalEnginesSchema);
  const isValid = packageJsonValidator(JSON.parse(ctx.packageJsonString));
  if (!isValid) {
    throw new Error(`Invalid package.json: ${ajv.errorsText(packageJsonValidator.errors)}`);
  }

  return isValid;
};

const checkEnginesTasks = ({
  options,
  parent,
}: {
  options: Options;
  parent: Omit<ListrTaskWrapper<CheckEnginesContext, typeof ListrRenderer, typeof ListrRenderer>, 'skip' | 'enabled'>;
}): ListrTask<CheckEnginesContext>[] => [
  {
    title: 'Reading package-lock.json...',
    task: async (ctx: CheckEnginesContext): Promise<void> => {
      ctx.packageLockString = await fs.readFile(options.packageLockPath, 'utf8');
    },
  },
  {
    title: 'Reading package.json...',
    task: async (ctx: CheckEnginesContext): Promise<void> => {
      ctx.packageJsonString = await fs.readFile(options.packageJsonPath, 'utf8');
    },
  },
  {
    title: 'Validating package-lock.json...',
    task: (ctx: CheckEnginesContext): void => {
      validatePackageLock(ctx);
    },
  },
  {
    title: 'Validating package.json...',
    task: (ctx: CheckEnginesContext): void => {
      validatePackageJson(ctx);
    },
  },
  {
    title: 'Compute engines range constraints...',
    task: (ctx: CheckEnginesContext): void => {
      Object.assign(ctx, checkEnginesFromString(merge({}, ctx, { engines: options.engines })));
    },
  },
  {
    title: 'Output computed engines range constraints...',
    task: (ctx: CheckEnginesContext): void => {
      const enginesRangeToSet = ctx.enginesRangeToSet!;
      const arrowSeparator: string = '→';
      let colWidths: [number, number, number, number] = [2, 2, 2, 2];
      let colValues: [string, string, string, string][] = [];

      for (const { engine, range, rangeToSet } of enginesRangeToSet) {
        debug.extend(engine)(
          `${chalk.white(`Simplified computed engine range constraint:`)} ${chalk.blue(rangeToSet)}`,
        );
        colWidths = [
          Math.max(colWidths[0], engine.length + 2),
          Math.max(colWidths[1], range.length + 2),
          arrowSeparator.length + 2,
          Math.max(colWidths[3], rangeToSet.length + 2),
        ];
        colValues.push([engine, range, arrowSeparator, rangeToSet]);
      }

      if (0 === enginesRangeToSet.length) {
        parent.title = `All computed engines range constraints are up-to-date ${chalk.green(':)')}`;
      } else {
        const table: Table = createOutputTable(colWidths);
        table.push(...colValues);
        let title = `Computed engines range constraints:\n\n${table.toString()}`;

        if (!options.update) {
          title += `\n\nRun ${chalk.cyan(generateUpdateCommandFromContext(options))} to upgrade package.json.`;
        }

        parent.title = title;
      }
    },
  },
  {
    title: 'Updating package.json...',
    skip: () => (!options.update ? 'Update is disabled by default.' : !options.update),
    task: (ctx: CheckEnginesContext) => {
      debug(`${chalk.white(`Write JSON to`)} ${chalk.blue('package.json')}`);
      return Promise.all([
        fs.writeFile(options.packageJsonPath, JSON.stringify(sortPackageJson(ctx.packageJson!), null, 2) + '\n'),
        fs.writeFile(options.packageLockPath, JSON.stringify(ctx.packageLock, null, 2) + '\n'),
      ]);
    },
  },
  {
    title: 'Enabling engine-strict using .npmrc...',
    skip: () =>
      !options.enableEngineStrict ? 'Enabling engine-strict is disabled by default.' : !options.enableEngineStrict,
    task: async (): Promise<void> => {
      const path = '.npmrc' as const;

      try {
        await fs.access(path, fs.constants.F_OK | fs.constants.R_OK);
        const contents = await fs.readFile(path, 'utf8');

        if (contents.includes('engine-strict=true')) {
          debug('.npmrc file already contains engine-strict=true');
        } else {
          await fs.appendFile(path, 'engine-strict=true\n');
          debug('.npmrc file has been updated to set engine-strict=true');
        }
      } catch {
        await fs.writeFile(path, 'engine-strict=true\n');
        debug('.npmrc file has been created and set engine-strict=true');
      }
    },
  },
];

const checkEnginesCommand = ({
  options,
  context,
}: {
  options: Options;
  context: ListrBaseClassOptions<CheckEnginesContext, ListrRendererValue, ListrRendererValue>;
}): Listr<CheckEnginesContext, ListrRendererValue, ListrRendererValue> => {
  return new Listr(
    [
      {
        title: `Checking npm package engines range constraints in package-lock.json...`,
        task: (_, task) => task.newListr(parent => checkEnginesTasks({ parent, options })),
      },
    ],
    context,
  );
};
