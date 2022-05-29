import Ajv from 'ajv-draft-04';
import { PackageJSONSchema, PackageLockJSONSchema } from './types';
import * as packageJSONSchema from '../schemas/package.json';
import * as packageLockJSONSchema from '../schemas/package-lock.json';
import addFormats from 'ajv-formats';

const ajv = addFormats(
  new Ajv({
    allErrors: true,
    coerceTypes: true,
    allowUnionTypes: true,
    strict: false,
    allowMatchingProperties: true,
  }),
);

export const validatePackageJSONFn = ajv.compile<PackageJSONSchema>(packageJSONSchema);
export const validatePackageLockJSONFn = ajv.compile<PackageLockJSONSchema>(packageLockJSONSchema);
