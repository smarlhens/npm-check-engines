import { nce } from '../../lib/index';
import { CLIArgs } from '../../lib/yargs';
import SpyInstance = jest.SpyInstance;
const debug = require('debug');

describe('index', () => {
  let consoleInfoSpy: SpyInstance;
  let consoleLogSpy: SpyInstance;
  let consoleErrorSpy: SpyInstance;
  let cliArgs: CLIArgs;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(global.console, 'log').mockImplementation(jest.fn());
    consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation(jest.fn());
    consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation(jest.fn());
  });

  it('should run w/ path', async () => {
    cliArgs = {
      $0: 'nce',
      path: 'examples',
      p: 'examples',
    };

    const res = await nce(Promise.resolve(cliArgs));

    expect(res).toEqual(
      expect.objectContaining({
        simplifiedComputedRange: '^14.17.0 || ^16.10.0 || >=17.0.0',
      }),
    );
  });
});
