import { beforeEach, describe, expect, it, vi } from 'vitest';

import { nce } from '../../lib/index.js';
import type { CLIArgs } from '../../lib/yargs.js';

describe('index', () => {
  let cliArgs: CLIArgs;

  beforeEach(() => {
    vi.spyOn(global.console, 'log').mockImplementation(() => vi.fn());
    vi.spyOn(global.console, 'info').mockImplementation(() => vi.fn());
    vi.spyOn(global.console, 'error').mockImplementation(() => vi.fn());
  });

  it('should run w/ path', async () => {
    cliArgs = {
      $0: 'nce',
      path: 'examples',
      p: 'examples',
    };

    const res = await nce(cliArgs);

    expect(res).toEqual(
      expect.objectContaining({
        rangesSimplified: new Map([['node', '^14.17.0 || ^16.10.0 || >=17.0.0']]),
      }),
    );
  });

  it('should run w/ path, debug', async () => {
    cliArgs = {
      $0: 'nce',
      path: 'examples',
      p: 'examples',
      debug: true,
      d: true,
    };

    const res = await nce(cliArgs);

    expect(res).toEqual(
      expect.objectContaining({
        rangesSimplified: new Map([['node', '^14.17.0 || ^16.10.0 || >=17.0.0']]),
      }),
    );
  });
});
