/* istanbul ignore file */

import * as packageJSONSchema from '../schemas/package.json';
import * as packageLockJSONSchema from '../schemas/package-lock.json';
import { JTDDataType } from 'ajv/dist/types/jtd-schema';
import { Range } from 'semver';

/**
 * Info props is inferred manually because Ajv JTDDataType: https://ajv.js.org/guide/typescript.html#utility-type-for-jtd-data-type
 */
export const EngineConstraintKeys = ['node', 'npm'] as const;
export type EngineConstraintKeysType = typeof EngineConstraintKeys;
export type EngineConstraintKey = EngineConstraintKeysType[number];
export type LockPackageEnginesObject = Partial<Record<EngineConstraintKey, string>>;
export type LockPackageEnginesArray = string[];
export type LockPackageEngines = LockPackageEnginesObject | LockPackageEnginesArray;
export type LockPackage = {
  engines: LockPackageEngines;
};
export type PackageJSONSchema = JTDDataType<typeof packageJSONSchema>;
export type PackageLockJSONSchema = JTDDataType<typeof packageLockJSONSchema> & {
  packages: {
    [k: string]: LockPackage;
  };
};
export type CLIContext = {
  path: string;
  update: boolean;
  quiet: boolean;
  workingDir: string;
  verbose: boolean;
  debug: boolean;
  engines?: string[];
  packageLockObject?: PackageLockJSONSchema;
  ranges?: Map<EngineConstraintKey, Range | undefined>;
  rangesSimplified?: Map<EngineConstraintKey, string | undefined>;
};
export type CheckCommandContext = CLIContext;
