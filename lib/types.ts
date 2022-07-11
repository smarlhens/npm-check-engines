/* istanbul ignore file */
import { JTDDataType } from 'ajv/dist/types/jtd-schema';
import { Range } from 'semver';

import * as packageLockJSONSchema from '../schemas/schema-package-lock.json';
import * as packageJSONSchema from '../schemas/schema-package.json';

/**
 * Info props is inferred manually because Ajv JTDDataType: https://ajv.js.org/guide/typescript.html#utility-type-for-jtd-data-type
 */

export const packageJSONFilename = 'package.json' as const;
export const packageLockJSONFilename = 'package-lock.json' as const;
export const EngineConstraintKeys = ['node', 'npm', 'yarn'] as const;
export type EngineConstraintKeysType = typeof EngineConstraintKeys;
export type EngineConstraintKey = EngineConstraintKeysType[number];
export type EngineConstraintChange = { from: Range | undefined; to: Range };
export type LockPackageEnginesObject = Partial<Record<EngineConstraintKey, string>>;
export type LockPackageEnginesArray = string[];
export type LockPackageEngines = LockPackageEnginesObject | LockPackageEnginesArray;
export type LockPackage = {
  engines: LockPackageEngines;
};
export type FileObject<T> = { filename: string; relativePath?: string; data?: T };
export type PackageJSONSchema = JTDDataType<typeof packageJSONSchema> & LockPackage;
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
  packageObject: FileObject<PackageJSONSchema>;
  packageLockObject: FileObject<PackageLockJSONSchema>;
  ranges?: Map<EngineConstraintKey, EngineConstraintChange>;
  rangesSimplified?: Map<EngineConstraintKey, string | undefined>;
};
export type CheckCommandContext = CLIContext;
