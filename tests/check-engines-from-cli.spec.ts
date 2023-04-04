import { execaCommand, Options } from 'execa';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('check engines from cli', () => {
  it('should check w/ package w/o engines w/o npmrc', async () => {
    const execaOptions: Options = {
      cwd: resolve(process.cwd(), 'examples', 'without-engines-without-npmrc'),
      stdio: 'pipe',
      cleanup: true,
    };
    const { stdout } = await execaCommand(
      `node --experimental-specifier-resolution=node --loader ts-node/esm ${resolve(process.cwd(), 'bin', 'nce.ts')}`,
      execaOptions,
    );
    expect(stdout).toEqual(
      '[STARTED] Checking npm package engines range constraints in package-lock.json...\n' +
        '[STARTED] Reading package-lock.json...\n' +
        '[SUCCESS] Reading package-lock.json...\n' +
        '[STARTED] Reading package.json...\n' +
        '[SUCCESS] Reading package.json...\n' +
        '[STARTED] Validating package-lock.json...\n' +
        '[SUCCESS] Validating package-lock.json...\n' +
        '[STARTED] Validating package.json...\n' +
        '[SUCCESS] Validating package.json...\n' +
        '[STARTED] Compute engines range constraints...\n' +
        '[SUCCESS] Compute engines range constraints...\n' +
        '[STARTED] Output computed engines range constraints...\n' +
        '[TITLE] Computed engines range constraints:\n' +
        '[TITLE] \n' +
        '[TITLE]  node  *  →  ^14.17.0 || ^16.10.0 || >=17.0.0 \n' +
        '[TITLE]  npm   *  →  >=6.0.0                          \n' +
        '[TITLE]  yarn  *  →  ^1.22.4                          \n' +
        '[TITLE] \n' +
        `[TITLE] Run nce -u to upgrade package.json.\n` +
        '[SUCCESS] Output computed engines range constraints...\n' +
        '[STARTED] Updating package.json...\n' +
        '[SKIPPED] Update is disabled by default.\n' +
        '[STARTED] Enabling engine-strict using .npmrc...\n' +
        '[SKIPPED] Enabling engine-strict is disabled by default.\n' +
        '[SUCCESS] Computed engines range constraints:\n' +
        '[SUCCESS] \n' +
        '[SUCCESS]  node  *  →  ^14.17.0 || ^16.10.0 || >=17.0.0 \n' +
        '[SUCCESS]  npm   *  →  >=6.0.0                          \n' +
        '[SUCCESS]  yarn  *  →  ^1.22.4                          \n' +
        '[SUCCESS] \n' +
        `[SUCCESS] Run nce -u to upgrade package.json.`,
    );
  }, 10000);

  it('should check w/ package w/o engines w/ npmrc w/o engine-strict', async () => {
    const execaOptions: Options = {
      cwd: resolve(process.cwd(), 'examples', 'without-engines-with-npmrc-without-engine-strict'),
      stdio: 'pipe',
      cleanup: true,
    };
    const { stdout } = await execaCommand(
      `node --experimental-specifier-resolution=node --loader ts-node/esm ${resolve(process.cwd(), 'bin', 'nce.ts')}`,
      execaOptions,
    );
    expect(stdout).toEqual(
      '[STARTED] Checking npm package engines range constraints in package-lock.json...\n' +
        '[STARTED] Reading package-lock.json...\n' +
        '[SUCCESS] Reading package-lock.json...\n' +
        '[STARTED] Reading package.json...\n' +
        '[SUCCESS] Reading package.json...\n' +
        '[STARTED] Validating package-lock.json...\n' +
        '[SUCCESS] Validating package-lock.json...\n' +
        '[STARTED] Validating package.json...\n' +
        '[SUCCESS] Validating package.json...\n' +
        '[STARTED] Compute engines range constraints...\n' +
        '[SUCCESS] Compute engines range constraints...\n' +
        '[STARTED] Output computed engines range constraints...\n' +
        '[TITLE] Computed engines range constraints:\n' +
        '[TITLE] \n' +
        '[TITLE]  node  *  →  ^14.17.0 || ^16.10.0 || >=17.0.0 \n' +
        '[TITLE]  npm   *  →  >=6.0.0                          \n' +
        '[TITLE]  yarn  *  →  ^1.22.4                          \n' +
        '[TITLE] \n' +
        `[TITLE] Run nce -u to upgrade package.json.\n` +
        '[SUCCESS] Output computed engines range constraints...\n' +
        '[STARTED] Updating package.json...\n' +
        '[SKIPPED] Update is disabled by default.\n' +
        '[STARTED] Enabling engine-strict using .npmrc...\n' +
        '[SKIPPED] Enabling engine-strict is disabled by default.\n' +
        '[SUCCESS] Computed engines range constraints:\n' +
        '[SUCCESS] \n' +
        '[SUCCESS]  node  *  →  ^14.17.0 || ^16.10.0 || >=17.0.0 \n' +
        '[SUCCESS]  npm   *  →  >=6.0.0                          \n' +
        '[SUCCESS]  yarn  *  →  ^1.22.4                          \n' +
        '[SUCCESS] \n' +
        `[SUCCESS] Run nce -u to upgrade package.json.`,
    );
  }, 10000);

  it('should check w/ package w/o engines w/ npmrc w/ engine-strict', async () => {
    const execaOptions: Options = {
      cwd: resolve(process.cwd(), 'examples', 'without-engines-with-npmrc-with-engine-strict'),
      stdio: 'pipe',
      cleanup: true,
    };
    const { stdout } = await execaCommand(
      `node --experimental-specifier-resolution=node --loader ts-node/esm ${resolve(process.cwd(), 'bin', 'nce.ts')}`,
      execaOptions,
    );
    expect(stdout).toEqual(
      '[STARTED] Checking npm package engines range constraints in package-lock.json...\n' +
        '[STARTED] Reading package-lock.json...\n' +
        '[SUCCESS] Reading package-lock.json...\n' +
        '[STARTED] Reading package.json...\n' +
        '[SUCCESS] Reading package.json...\n' +
        '[STARTED] Validating package-lock.json...\n' +
        '[SUCCESS] Validating package-lock.json...\n' +
        '[STARTED] Validating package.json...\n' +
        '[SUCCESS] Validating package.json...\n' +
        '[STARTED] Compute engines range constraints...\n' +
        '[SUCCESS] Compute engines range constraints...\n' +
        '[STARTED] Output computed engines range constraints...\n' +
        '[TITLE] Computed engines range constraints:\n' +
        '[TITLE] \n' +
        '[TITLE]  node  *  →  ^14.17.0 || ^16.10.0 || >=17.0.0 \n' +
        '[TITLE]  npm   *  →  >=6.0.0                          \n' +
        '[TITLE]  yarn  *  →  ^1.22.4                          \n' +
        '[TITLE] \n' +
        `[TITLE] Run nce -u to upgrade package.json.\n` +
        '[SUCCESS] Output computed engines range constraints...\n' +
        '[STARTED] Updating package.json...\n' +
        '[SKIPPED] Update is disabled by default.\n' +
        '[STARTED] Enabling engine-strict using .npmrc...\n' +
        '[SKIPPED] Enabling engine-strict is disabled by default.\n' +
        '[SUCCESS] Computed engines range constraints:\n' +
        '[SUCCESS] \n' +
        '[SUCCESS]  node  *  →  ^14.17.0 || ^16.10.0 || >=17.0.0 \n' +
        '[SUCCESS]  npm   *  →  >=6.0.0                          \n' +
        '[SUCCESS]  yarn  *  →  ^1.22.4                          \n' +
        '[SUCCESS] \n' +
        `[SUCCESS] Run nce -u to upgrade package.json.`,
    );
  }, 10000);
});
