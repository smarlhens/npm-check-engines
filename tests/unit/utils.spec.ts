import { getJson, getRelativePath, isAbsolutePath, joinPath } from '../../lib/utils';

const fsExtra = require('fs-extra');
const path = require('path');

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

  it('should call readJson function from fs-extra', () => {
    const spy = jest.spyOn(fsExtra, 'readJson').mockReturnValue(Promise.resolve());
    getJson('/path/to');
    expect(spy).toHaveBeenCalledWith('/path/to', { encoding: 'utf8' });
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
});
