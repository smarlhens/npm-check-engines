import { describe, expect, it } from 'vitest';

import { CheckEnginesContext, checkEnginesFromString } from '../lib/nce.js';

describe('check engines from string', () => {
  it('should return engine ranges to set using lock file version 2', async () => {
    const params: CheckEnginesContext = {
      packageJsonString: '{"name":"fake","private":true}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/foo":{"engines":{"node":">=6.9.0"}},"node_modules/bar":{"engines":{"node":">=12.22.0","npm":">=6.0.0","yarn":"^1.22.4"}},"node_modules/all":{"engines":{"node":"*"}},"node_modules/arr":{"engines":["node >= 7"]},"node_modules/noengines":{},"node_modules/complex1":{"engines":{"node":"^12.13.0 || ^14.15.0 || ^16.10.0 || >=17.0.0"}},"node_modules/complex2":{"engines":{"node":">=16.0.0||^14.17.0"}}}}',
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
      enginesRangeToSet: [
        { engine: 'node', range: '*', rangeToSet: '^14.17.0 || ^16.10.0 || >=17.0.0' },
        { engine: 'npm', range: '*', rangeToSet: '>=6.0.0' },
        { engine: 'yarn', range: '*', rangeToSet: '^1.22.4' },
      ],
    });
  });

  it('should return engine ranges to set using lock file version 1', async () => {
    const params: CheckEnginesContext = {
      packageJsonString: '{"name":"fake","private":true}',
      packageLockString:
        '{"name":"fake","lockfileVersion":1,"requires":true,"dependencies":{"foo":{"engines":{"node":">=6.9.0"}},"bar":{"engines":{"node":">=12.22.0","npm":">=6.0.0","yarn":"^1.22.4"}},"all":{"engines":{"node":"*"}},"arr":{"engines":["node >= 7"]},"noengines":{},"complex1":{"engines":{"node":"^12.13.0 || ^14.15.0 || ^16.10.0 || >=17.0.0"}},"complex2":{"engines":{"node":">=16.0.0||^14.17.0"}}}}',
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
      packageJsonString: '{"name":"fake","private":true}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/foo":{"engines":{"node":">=6.9.0"}},"node_modules/bar":{"engines":{"node":">=12.22.0","npm":">=6.0.0","yarn":"^1.22.4"}},"node_modules/all":{"engines":{"node":"*"}},"node_modules/arr":{"engines":["node >= 7"]},"node_modules/noengines":{},"node_modules/complex1":{"engines":{"node":"^12.13.0 || ^14.15.0 || ^16.10.0 || >=17.0.0"}},"node_modules/complex2":{"engines":{"node":">=16.0.0||^14.17.0"}}}}',
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
      enginesRangeToSet: [{ engine: 'node', range: '*', rangeToSet: '^14.17.0 || ^16.10.0 || >=17.0.0' }],
    });
  });

  it('should return no engine range to set if no range defined', async () => {
    const params: CheckEnginesContext = {
      engines: ['npm'],
      packageJsonString: '{"name":"fake","private":true}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/foo":{"engines":{"node":">=6.9.0"}},"node_modules/bar":{"engines":{"node":">=12.22.0"}},"node_modules/all":{"engines":{"node":"*"}},"node_modules/arr":{"engines":["node >= 7"]},"node_modules/noengines":{},"node_modules/complex1":{"engines":{"node":"^12.13.0 || ^14.15.0 || ^16.10.0 || >=17.0.0"}},"node_modules/complex2":{"engines":{"node":">=16.0.0||^14.17.0"}}}}',
    };
    const payload = checkEnginesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
      },
      enginesRangeToSet: [],
    });
  });

  it('should return no engine range to set if range is already defined', async () => {
    const params: CheckEnginesContext = {
      engines: ['npm'],
      packageJsonString: '{"name":"fake","private":true,"engines":{"node":">=12.22.0"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/foo":{"engines":{"node":">=6.9.0"}},"node_modules/bar":{"engines":{"node":">=12.22.0"}},"node_modules/all":{"engines":{"node":"*"}},"node_modules/arr":{"engines":["node >= 7"]},"node_modules/noengines":{},"node_modules/complex1":{"engines":{"node":"^12.13.0 || ^14.15.0 || ^16.10.0 || >=17.0.0"}},"node_modules/complex2":{"engines":{"node":">=16.0.0||^14.17.0"}}}}',
    };
    const payload = checkEnginesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
        engines: { node: '>=12.22.0' },
      },
      enginesRangeToSet: [],
    });
  });
});
