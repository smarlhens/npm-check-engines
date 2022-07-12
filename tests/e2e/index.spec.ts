import { nce } from '../../lib/index';
import { CLIArgs } from '../../lib/yargs';

describe('index', () => {
  let cliArgs: CLIArgs;

  beforeEach(() => {
    jest.spyOn(global.console, 'log').mockImplementation(jest.fn());
    jest.spyOn(global.console, 'info').mockImplementation(jest.fn());
    jest.spyOn(global.console, 'error').mockImplementation(jest.fn());
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
