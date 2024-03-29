import { describe, expect, it } from 'vitest';

import { validatePackageLock } from '../lib/nce.js';

describe('validate package lock', () => {
  it('should return valid lockfileversion 1 w/ dependencies', async () => {
    const params = {
      packageLockString: '{"lockfileVersion":1,"dependencies":{}}',
    };
    expect(validatePackageLock(params)).toEqual(true);
  });

  it('should return invalid lockfileversion 1 w/o dependencies', async () => {
    const params = {
      packageLockString: '{"lockfileVersion":1}',
    };
    expect(() => validatePackageLock(params)).toThrowError(/must have required property 'dependencies'/);
  });

  it('should return valid lockfileversion 2 w/ dependencies only', async () => {
    const params = {
      packageLockString: '{"lockfileVersion":2,"dependencies":{}}',
    };
    expect(validatePackageLock(params)).toEqual(true);
  });

  it('should return invalid lockfileversion 2 w/ packages only', async () => {
    const params = {
      packageLockString: '{"lockfileVersion":2,"packages":{}}',
    };
    expect(() => validatePackageLock(params)).toThrowError(/must have required property 'dependencies'/);
  });

  it('should return invalid lockfileversion 2 w/o dependencies', async () => {
    const params = {
      packageLockString: '{"lockfileVersion":2}',
    };
    expect(() => validatePackageLock(params)).toThrowError(/must have required property 'dependencies'/);
  });

  it('should return valid lockfileversion 2 w/ dependencies & packages', async () => {
    const params = {
      packageLockString: '{"lockfileVersion":2,"dependencies":{},"packages":{}}',
    };
    expect(validatePackageLock(params)).toEqual(true);
  });

  it('should return valid lockfileversion 3 w/ packages', async () => {
    const params = {
      packageLockString: '{"lockfileVersion":3,"packages":{}}',
    };
    expect(validatePackageLock(params)).toEqual(true);
  });

  it('should return invalid lockfileversion 3 w/o packages', async () => {
    const params = {
      packageLockString: '{"lockfileVersion":3}',
    };
    expect(() => validatePackageLock(params)).toThrowError(/must have required property 'dependencies'/);
  });
});
