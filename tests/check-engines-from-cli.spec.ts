import { resolve } from 'node:path';
import { x } from 'tinyexec';
import { describe, expect, it, vi } from 'vitest';

describe('check engines from cli', () => {
  it('should check w/ package w/o engines w/o npmrc', async () => {
    vi.stubEnv('NODE_ENV', 'test');

    const result = await x('node', [resolve(process.cwd(), 'dist', 'bin', 'nce.js')], {
      nodeOptions: {
        cwd: resolve(process.cwd(), 'examples', 'without-engines-without-npmrc'),
        env: { ...process.env, NO_COLOR: '1' },
      },
    });
    expect(result.stdout).toMatchSnapshot();
  }, 10000);

  it('should check w/ package w/o engines w/ npmrc w/o engine-strict', async () => {
    vi.stubEnv('NODE_ENV', 'test');

    const result = await x('node', [resolve(process.cwd(), 'dist', 'bin', 'nce.js')], {
      nodeOptions: {
        cwd: resolve(process.cwd(), 'examples', 'without-engines-with-npmrc-without-engine-strict'),
        env: { ...process.env, NO_COLOR: '1' },
      },
    });
    expect(result.stdout).toMatchSnapshot();
  }, 10000);

  it('should check w/ package w/o engines w/ npmrc w/ engine-strict', async () => {
    vi.stubEnv('NODE_ENV', 'test');

    const result = await x('node', [resolve(process.cwd(), 'dist', 'bin', 'nce.js')], {
      nodeOptions: {
        cwd: resolve(process.cwd(), 'examples', 'without-engines-with-npmrc-with-engine-strict'),
        env: { ...process.env, NO_COLOR: '1' },
      },
    });
    expect(result.stdout).toMatchSnapshot();
  }, 10000);
});
