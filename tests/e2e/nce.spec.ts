import { Options } from 'execa';
const execa = require('execa');
const path = require('path');

describe('nce', () => {
  it('should check engines from examples lock file', async () => {
    const execaOptions: Options = { cwd: path.resolve(__dirname, '..', '..'), stdio: 'pipe', cleanup: true };
    const { stdout } = await execa.command(`ts-node bin/nce.ts -p examples`, execaOptions);
    expect(stdout).toEqual(
      '[STARTED] Checking npm package node engines constraints in package-lock.json file...\n' +
        `[TITLE] Checking npm package node engines constraints in examples${path.sep}package-lock.json file...\n` +
        '[STARTED] Load package-lock.json file...\n' +
        '[SUCCESS] Load package-lock.json file...\n' +
        '[STARTED] Compute node engines constraints...\n' +
        '[SUCCESS] Compute node engines constraints...\n' +
        '[STARTED] Output computed node engines constraints...\n' +
        '[TITLE] Computed node engines range: ^14.17.0 || ^16.10.0 || >=17.0.0\n' +
        '[SUCCESS] Output computed node engines constraints...\n' +
        '[STARTED] Update package.json file...\n' +
        '[SKIPPED] Update is disabled by default.\n' +
        '[SUCCESS] Computed node engines range: ^14.17.0 || ^16.10.0 || >=17.0.0',
    );
  }, 10000);
});
