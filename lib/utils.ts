import { readJson } from 'fs-extra';
import { isAbsolute, join, relative } from 'path';

export const getJson = <T>(path: string): Promise<T> => readJson(path, { encoding: 'utf8' });
export const isAbsolutePath = (p: string): boolean => isAbsolute(p);
export const joinPath = (...paths: string[]): string => join(...paths);
export const getRelativePath = (options: { workingDir: string; path?: string }): string => {
  const { workingDir, path } = options;

  if (!path) {
    return workingDir;
  }

  if (isAbsolutePath(path)) {
    return relative(workingDir, path);
  } else {
    return relative(workingDir, joinPath(workingDir, path));
  }
};
