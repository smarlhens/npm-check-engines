import fs from 'node:fs/promises';
import nodePath from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { getJson, getRelativePath, isAbsolutePath, joinPath, writeJson } from '../../lib/utils.js';

describe('utils', () => {
  it('should return relative path based on cwd from absolute', () => {
    const relativePath = getRelativePath({
      path: '/foo/bar',
      workingDir: '/foo',
    });

    expect(relativePath).toEqual('bar');
  });

  it('should return relative path based cwd from relative', () => {
    const path = getRelativePath({
      path: 'bar',
      workingDir: 'foo',
    });

    expect(path).toEqual('bar');
  });

  it('should return relative path based cwd from relative', () => {
    const path = getRelativePath({
      workingDir: 'foo',
    });

    expect(path).toEqual('foo');
  });

  it('should call readFile function from fs', () => {
    const spy = vi.spyOn(fs, 'readFile').mockReturnValue(Promise.resolve(JSON.stringify({ foo: 'bar' }, null, 2)));
    getJson('/path/to');
    expect(spy).toHaveBeenCalledWith('/path/to', 'utf8');
  });

  it('should call isAbsolute from path', () => {
    const spy = vi.spyOn(nodePath, 'isAbsolute').mockReturnValueOnce(true);
    const isAbsolute = isAbsolutePath('foo');
    expect(isAbsolute).toEqual(true);
    expect(spy).toHaveBeenCalledWith('foo');
  });

  it('should call join from path', () => {
    const spy = vi.spyOn(nodePath, 'join').mockReturnValueOnce('foo/bar');
    const joinedPath = joinPath('foo', 'bar');
    expect(joinedPath).toEqual('foo/bar');
    expect(spy).toHaveBeenCalledWith('foo', 'bar');
  });

  it('should call writeFile function from fs', () => {
    const spy = vi.spyOn(fs, 'writeFile').mockReturnValue(Promise.resolve());
    writeJson('/path/to', { foo: 'bar' });
    expect(spy).toHaveBeenCalledWith('/path/to', JSON.stringify({ foo: 'bar' }, null, 2), 'utf8');
  });
});
