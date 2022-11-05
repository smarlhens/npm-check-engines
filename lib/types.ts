/* istanbul ignore file */
import type { Range } from 'semver';

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
export type PackageJSONSchema = LockPackage;
export type PackageLockJSONSchema = {
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
  engines: string[] | undefined;
  packageObject: FileObject<PackageJSONSchema>;
  packageLockObject: FileObject<PackageLockJSONSchema>;
  ranges?: Map<EngineConstraintKey, EngineConstraintChange>;
  rangesSimplified?: Map<EngineConstraintKey, string | undefined>;
};
export type CheckCommandContext = CLIContext;
