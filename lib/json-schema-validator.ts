import Ajv from 'ajv-draft-04';
import addFormats from 'ajv-formats';

export const packageJSONSchema = '../schemas/schema-package.json' as const;
export const packageLockJSONSchema = '../schemas/schema-package-lock.json' as const;

export const ajv = addFormats(
  new Ajv({
    allErrors: true,
    coerceTypes: true,
    allowUnionTypes: true,
    strict: false,
    allowMatchingProperties: true,
  }),
);
