import { describe, expect, it } from 'vitest';

import packageJson from '../examples/package.json';
import packageWithComplexSemverAllEngines from '../examples/with-complex-semver-node-npm-yarn/package-lock.json';
import packageWithComplexSemverNode from '../examples/with-complex-semver-node/package-lock.json';
import packageLockWithIncompatibleSemver from '../examples/with-incompatible-semver/package-lock.json';
import packageJsonWithIncompatibleSemver from '../examples/with-incompatible-semver/package.json';
import packageWithLockFileVersion1 from '../examples/with-lock-file-version-1/package-lock.json';
import packageJsonWithLockFileVersion1 from '../examples/with-lock-file-version-1/package.json';
import packageWithLockFileVersion2 from '../examples/with-lock-file-version-2-dependencies-packages/package-lock.json';
import packageWithLockFileVersion2Dependencies from '../examples/with-lock-file-version-2-dependencies/package-lock.json';
import packageWithLockFileVersion3 from '../examples/with-lock-file-version-3/package-lock.json';
import { CheckEnginesContext, checkEnginesFromString } from '../lib/nce.js';

describe('check engines from string', () => {
  const packageJsonString = JSON.stringify(packageJson);

  it('should return engine ranges to set using complex semver & all engines', async () => {
    const params: CheckEnginesContext = {
      packageJsonString,
      packageLockString: JSON.stringify(packageWithComplexSemverAllEngines),
    };
    const payload = checkEnginesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
        engines: {
          node: '^14.17.0 || ^16.10.0 || >=17.0.0',
          npm: '>=6.0.0',
          yarn: '^1.22.4',
        },
      },
      packageLock: expect.objectContaining({
        packages: expect.objectContaining({
          '': expect.objectContaining({
            engines: { node: '^14.17.0 || ^16.10.0 || >=17.0.0', npm: '>=6.0.0', yarn: '^1.22.4' },
          }),
        }),
      }),
      enginesRangeToSet: [
        { engine: 'node', range: '*', rangeToSet: '^14.17.0 || ^16.10.0 || >=17.0.0' },
        { engine: 'npm', range: '*', rangeToSet: '>=6.0.0' },
        { engine: 'yarn', range: '*', rangeToSet: '^1.22.4' },
      ],
    });
  });

  it('should return only node engine range to set', async () => {
    const params: CheckEnginesContext = {
      engines: ['node'],
      packageJsonString,
      packageLockString: JSON.stringify(packageWithComplexSemverNode),
    };
    const payload = checkEnginesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
        engines: {
          node: '^14.17.0 || ^16.10.0 || >=17.0.0',
        },
      },
      packageLock: expect.objectContaining({
        packages: expect.objectContaining({
          '': expect.objectContaining({
            engines: { node: '^14.17.0 || ^16.10.0 || >=17.0.0' },
          }),
        }),
      }),
      enginesRangeToSet: [{ engine: 'node', range: '*', rangeToSet: '^14.17.0 || ^16.10.0 || >=17.0.0' }],
    });
  });

  it('should return no engine range to set if no range defined', async () => {
    const params: CheckEnginesContext = {
      engines: ['npm'],
      packageJsonString,
      packageLockString: JSON.stringify(packageWithComplexSemverNode),
    };
    const payload = checkEnginesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
      },
      packageLock: expect.anything(),
      enginesRangeToSet: [],
    });
  });

  it('should return no engine range to set if range is already defined', async () => {
    const params: CheckEnginesContext = {
      engines: ['npm'],
      packageJsonString: '{"name":"fake","private":true,"engines":{"node":">=12.22.0"}}',
      packageLockString: JSON.stringify(packageWithComplexSemverNode),
    };
    const payload = checkEnginesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
        engines: { node: '>=12.22.0' },
      },
      packageLock: expect.anything(),
      enginesRangeToSet: [],
    });
  });

  it('should return no engine ranges to set using lock file version 1', async () => {
    const params: CheckEnginesContext = {
      packageJsonString,
      packageLockString: JSON.stringify(packageWithLockFileVersion1),
    };
    const payload = checkEnginesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
      },
      packageLock: expect.anything(),
      enginesRangeToSet: [],
    });
  });

  it('should return no engine ranges to set using lock file version 1 with engines set in package.json', async () => {
    const params: CheckEnginesContext = {
      packageJsonString: JSON.stringify(packageJsonWithLockFileVersion1),
      packageLockString: JSON.stringify(packageWithLockFileVersion1),
    };
    const payload = checkEnginesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
        engines: {
          node: '>=6.9.0',
        },
      },
      packageLock: expect.anything(),
      enginesRangeToSet: [],
    });
  });

  it('should return engine ranges to set using lock file version 2', async () => {
    const params: CheckEnginesContext = {
      packageJsonString,
      packageLockString: JSON.stringify(packageWithLockFileVersion2),
    };
    const payload = checkEnginesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
        engines: { node: '>=6.9.0' },
      },
      packageLock: expect.objectContaining({
        packages: expect.objectContaining({
          '': expect.objectContaining({
            engines: { node: '>=6.9.0' },
          }),
        }),
      }),
      enginesRangeToSet: [{ engine: 'node', range: '*', rangeToSet: '>=6.9.0' }],
    });
  });

  it('should return engine ranges to set using lock file version 2 w/ dependencies only', async () => {
    const params: CheckEnginesContext = {
      packageJsonString,
      packageLockString: JSON.stringify(packageWithLockFileVersion2Dependencies),
    };
    const payload = checkEnginesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
        engines: { node: '>=6.9.0' },
      },
      packageLock: expect.anything(),
      enginesRangeToSet: [{ engine: 'node', range: '*', rangeToSet: '>=6.9.0' }],
    });
  });

  it('should return engine ranges to set using lock file version 3', async () => {
    const params: CheckEnginesContext = {
      packageJsonString,
      packageLockString: JSON.stringify(packageWithLockFileVersion3),
    };
    const payload = checkEnginesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
        engines: { node: '>=6.9.0' },
      },
      packageLock: expect.objectContaining({
        packages: expect.objectContaining({
          '': expect.objectContaining({
            engines: { node: '>=6.9.0' },
          }),
        }),
      }),
      enginesRangeToSet: [{ engine: 'node', range: '*', rangeToSet: '>=6.9.0' }],
    });
  });

  it('should handle incompatible semver and the greatest one', async () => {
    const params: CheckEnginesContext = {
      packageJsonString: JSON.stringify(packageJsonWithIncompatibleSemver),
      packageLockString: JSON.stringify(packageLockWithIncompatibleSemver),
    };
    const payload = checkEnginesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
        engines: { node: '18.14' },
      },
      packageLock: expect.objectContaining({
        packages: expect.objectContaining({
          '': expect.objectContaining({
            engines: { node: '18.14' },
          }),
        }),
      }),
      enginesRangeToSet: [],
    });
  });
});
