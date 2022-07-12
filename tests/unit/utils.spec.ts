import { getJson, getRelativePath, isAbsolutePath, joinPath, writeJson } from '../../lib/utils';

const fs = require('node:fs/promises');
const path = require('node:path');

describe('utils', () => {
  it('should return relative path based on cwd from absolute', () => {
    const path = getRelativePath({
      path: '/foo/bar',
      workingDir: '/foo',
    });

    expect(path).toEqual('bar');
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
    const spy = jest.spyOn(fs, 'readFile').mockReturnValue(Promise.resolve(JSON.stringify({ foo: 'bar' }, null, 2)));
    getJson('/path/to');
    expect(spy).toHaveBeenCalledWith('/path/to', 'utf8');
  });

  it('should call isAbsolute from path', () => {
    const spy = jest.spyOn(path, 'isAbsolute').mockReturnValueOnce(true);
    const isAbsolute = isAbsolutePath('foo');
    expect(isAbsolute).toEqual(true);
    expect(spy).toHaveBeenCalledWith('foo');
  });

  it('should call join from path', () => {
    const spy = jest.spyOn(path, 'join').mockReturnValueOnce('foo/bar');
    const joinedPath = joinPath('foo', 'bar');
    expect(joinedPath).toEqual('foo/bar');
    expect(spy).toHaveBeenCalledWith('foo', 'bar');
  });

  it('should call writeFile function from fs', () => {
    const spy = jest.spyOn(fs, 'writeFile').mockReturnValue(Promise.resolve(JSON.stringify({ foo: 'bar' }, null, 2)));
    writeJson('/path/to', { foo: 'bar' });
    expect(spy).toHaveBeenCalledWith('/path/to', JSON.stringify({ foo: 'bar' }, null, 2), 'utf8');
  });
});
