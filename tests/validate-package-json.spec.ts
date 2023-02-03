import { describe, expect, it } from 'vitest';

import { validatePackageJson } from '../lib/nce.js';

describe('validate package json', () => {
  it('should return valid json w/o engines', async () => {
    const params = {
      packageJsonString: '{"name":"fake","private":true}',
    };
    expect(validatePackageJson(params)).toEqual(true);
  });

  it('should return valid json w/ array engines', async () => {
    const params = {
      packageJsonString: '{"name":"fake","private":true,"engines":["node >= 7"]}',
    };
    expect(validatePackageJson(params)).toEqual(true);
  });

  it('should return valid json w/ array engines empty', async () => {
    const params = {
      packageJsonString: '{"name":"fake","private":true,"engines":["node >= 7"]}',
    };
    expect(validatePackageJson(params)).toEqual(true);
  });

  it('should return valid json w/ object engines', async () => {
    const params = {
      packageJsonString: '{"name":"fake","private":true,"engines":{"node":">= 7"}}',
    };
    expect(validatePackageJson(params)).toEqual(true);
  });

  it('should return valid json w/ object engines empty', async () => {
    const params = {
      packageJsonString: '{"name":"fake","private":true,"engines":{}}',
    };
    expect(validatePackageJson(params)).toEqual(true);
  });
});
