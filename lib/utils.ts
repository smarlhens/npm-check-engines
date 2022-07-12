import { readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative } from 'node:path';

export const getJson = async <T>(path: string): Promise<T> => JSON.parse(await readFile(path, 'utf8'));
export const writeJson = async (path: string, obj: unknown): Promise<void> =>
  await writeFile(path, JSON.stringify(obj, null, 2), 'utf8');
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
