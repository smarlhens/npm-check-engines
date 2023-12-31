import { execaCommand, type Options } from 'execa';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

describe('check engines from cli', () => {
  it('should check w/ package w/o engines w/o npmrc', async () => {
    vi.stubEnv('NODE_ENV', 'test');

    const execaOptions: Options = {
      cwd: resolve(process.cwd(), 'examples', 'without-engines-without-npmrc'),
      stdio: 'pipe',
      cleanup: true,
    };
    const { stdout } = await execaCommand(`node ${resolve(process.cwd(), 'dist', 'bin', 'nce.js')}`, execaOptions);
    expect(stdout).toMatchSnapshot();
  }, 10000);

  it('should check w/ package w/o engines w/ npmrc w/o engine-strict', async () => {
    vi.stubEnv('NODE_ENV', 'test');

    const execaOptions: Options = {
      cwd: resolve(process.cwd(), 'examples', 'without-engines-with-npmrc-without-engine-strict'),
      stdio: 'pipe',
      cleanup: true,
    };
    const { stdout } = await execaCommand(`node ${resolve(process.cwd(), 'dist', 'bin', 'nce.js')}`, execaOptions);
    expect(stdout).toMatchSnapshot();
  }, 10000);

  it('should check w/ package w/o engines w/ npmrc w/ engine-strict', async () => {
    vi.stubEnv('NODE_ENV', 'test');

    const execaOptions: Options = {
      cwd: resolve(process.cwd(), 'examples', 'without-engines-with-npmrc-with-engine-strict'),
      stdio: 'pipe',
      cleanup: true,
    };
    const { stdout } = await execaCommand(`node ${resolve(process.cwd(), 'dist', 'bin', 'nce.js')}`, execaOptions);
    expect(stdout).toMatchSnapshot();
  }, 10000);
});
