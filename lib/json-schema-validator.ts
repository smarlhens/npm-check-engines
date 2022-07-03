import Ajv from 'ajv-draft-04';
import addFormats from 'ajv-formats';

import * as packageLockJSONSchema from '../schemas/package-lock.json';
import * as packageJSONSchema from '../schemas/package.json';
import { PackageJSONSchema, PackageLockJSONSchema } from './types';

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
