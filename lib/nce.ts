import Ajv, { JSONSchemaType } from 'ajv';
import chalk from 'chalk';
import Table from 'cli-table';
import * as constants from 'constants';
import Debug, { Debugger } from 'debug';
import { Listr, ListrBaseClassOptions, ListrRenderer, ListrTask, ListrTaskWrapper } from 'listr2';
import type { ListrDefaultRendererOptions, ListrRendererValue } from 'listr2';
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

type PackageJson = {
  engines: LockPackageEngines;
};

type PackageDependencies = { [dependencyName: string]: { engines: LockPackageEngines } };

type PackageLockVersion1 = {
  lockfileVersion: 1;
  dependencies: PackageDependencies;
};

type PackageLockVersion2 = {
  lockfileVersion: 2;
  packages: PackageDependencies;
};

type PackageLock = PackageLockVersion1 | PackageLockVersion2;

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
  packageJson: PackageJson;
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
): ListrDefaultRendererOptions<ListrRendererValue> => {
  if (quiet) {
    return { renderer: 'silent' };
  }

  if (verbose) {
    return { renderer: 'simple' };
  }

  const isDumbTerminal = env.TERM === 'dumb';

  if (debug || isDumbTerminal || env.NODE_ENV === 'test') {
    return { renderer: 'verbose' };
  }

  return { renderer: 'default', rendererOptions: { dateFormat: false } };
};

export const checkEnginesFromCLI = async (args: CLIArgs): Promise<CheckEnginesContext> => {
  const cliArgs = args;
  const isValidConstraintEngine = (value: string): value is EngineConstraintKey => value in EngineConstraintKeys;

  let options: Options = {
    workingDir: normalize(process.cwd()),
    update: cliArgs.update || false,
    verbose: cliArgs.verbose || false,
    quiet: cliArgs.quiet || false,
    debug: cliArgs.debug || false,
    engines: cliArgs.engines?.filter(isValidConstraintEngine) || [],
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
const packageJsonSchema: JSONSchemaType<PackageJson> = {
  type: 'object',
  properties: {
    engines: {
      oneOf: [
        {
          type: 'object',
          additionalProperties: {
            type: 'string',
          },
          required: [],
        },
        {
          type: 'array',
          additionalProperties: {
            type: 'string',
          },
        },
      ],
    },
  },
  required: [],
};

// @ts-ignore
const packageLockSchema: JSONSchemaType<PackageLock> = {
  type: 'object',
  properties: {
    lockfileVersion: {
      type: 'number',
    },
  },
  required: ['lockfileVersion'],
  oneOf: [
    {
      type: 'object',
      properties: {
        packages: {
          type: 'object',
          patternProperties: {
            '^.*$': {
              type: 'object',
              properties: {
                engines: {
                  oneOf: [
                    {
                      type: 'object',
                      additionalProperties: {
                        type: 'string',
                      },
                      required: [],
                    },
                    {
                      type: 'array',
                      additionalProperties: {
                        type: 'string',
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      required: ['packages'],
    },
    {
      type: 'object',
      properties: {
        dependencies: {
          type: 'object',
          patternProperties: {
            '^.*$': {
              type: 'object',
              properties: {
                engines: {
                  oneOf: [
                    {
                      type: 'object',
                      additionalProperties: {
                        type: 'string',
                      },
                      required: [],
                    },
                    {
                      type: 'array',
                      additionalProperties: {
                        type: 'string',
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      required: ['dependencies'],
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
  debug: Debugger,
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

  const minVersion1 = semver.minVersion(r1, rangeOptions) || new semver.SemVer('*');
  const minVersion2 = semver.minVersion(r2, rangeOptions) || new semver.SemVer('*');
  const sortedR1: semver.Comparator[][] = sortRangeSet(r1.set);
  const sortedR2: semver.Comparator[][] = sortRangeSet(r2.set);

  if (!semver.eq(minVersion1, minVersion2, rangeOptions)) {
    const minSemver = semver.compare(minVersion1, minVersion2) === -1 ? minVersion2 : minVersion1;
    debug(
      `${chalk.white('Applying minimal version')} ${chalk.yellow(minSemver.version)} ${chalk.white('to both ranges.')}`,
    );

    const newR1 = setToRange(applyMinVersionToRangeSet(sortedR1, minSemver));
    const newR2 = setToRange(applyMinVersionToRangeSet(sortedR2, minSemver));

    if (newR1.intersects(newR2, rangeOptions)) {
      return restrictiveRange(newR1, newR2, ignoredRanges, debug);
    } else {
      throw new Error('Not yet implemented :/');
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
  const packageJson: PackageJson = JSON.parse(ctx.packageJsonString);
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
  } else {
    packages = packageLock.packages;
  }

  for (const constraintKey of constraintKeys) {
    const from = computeEnginesConstraint({
      packages: { '': { engines: packageJson.engines || {} } },
      constraintKey,
      debug,
    });
    const to = computeEnginesConstraint({ packages, constraintKey, debug });
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
  }

  return {
    packageJson,
    enginesRangeToSet,
  };
};

const checkEnginesTasks = ({
  options,
  parent,
}: {
  options: Options;
  parent: Omit<ListrTaskWrapper<CheckEnginesContext, typeof ListrRenderer>, 'skip' | 'enabled'>;
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
      const packageLockValidator = ajv.compile(packageLockSchema);
      const isValid = packageLockValidator(JSON.parse(ctx.packageLockString));
      if (!isValid) {
        throw new Error(`Invalid package-lock.json: ${ajv.errorsText(packageLockValidator.errors)}`);
      }
    },
  },
  {
    title: 'Validating package.json...',
    task: (ctx: CheckEnginesContext): void => {
      const packageJsonValidator = ajv.compile(packageJsonSchema);
      const isValid = packageJsonValidator(JSON.parse(ctx.packageJsonString));
      if (!isValid) {
        throw new Error(`Invalid package.json: ${ajv.errorsText(packageJsonValidator.errors)}`);
      }
    },
  },
  {
    title: 'Compute engines range constraints...',
    task: (ctx: CheckEnginesContext): void => {
      Object.assign(ctx, checkEnginesFromString(ctx));
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
    title: 'Enabling engine-strict using .npmrc...',
    skip: () => (!options.update ? 'Enabling engine-strict is disabled by default.' : !options.update),
    task: async (): Promise<void> => {
      const path = '.npmrc' as const;

      try {
        await fs.access(path, constants.F_OK | constants.R_OK);
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
  {
    title: 'Updating package.json...',
    skip: () => (!options.update ? 'Update is disabled by default.' : !options.update),
    task: (ctx: CheckEnginesContext) => {
      debug(`${chalk.white(`Write JSON to`)} ${chalk.blue('package.json')}`);
      return fs.writeFile(options.packageJsonPath, JSON.stringify(sortPackageJson(ctx.packageJson!), null, 2));
    },
  },
];

const checkEnginesCommand = ({
  options,
  context,
}: {
  options: Options;
  context: ListrBaseClassOptions<CheckEnginesContext, ListrRendererValue>;
}): Listr<CheckEnginesContext, ListrRendererValue> => {
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
