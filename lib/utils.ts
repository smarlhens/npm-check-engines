import fs from 'node:fs/promises';
import nodePath from 'node:path';

export const getJson = async <T>(path: string): Promise<T> => JSON.parse(await fs.readFile(path, 'utf8'));
export const writeJson = async (path: string, obj: unknown): Promise<void> =>
  fs.writeFile(path, JSON.stringify(obj, null, 2), 'utf8');
export const isAbsolutePath = (p: string): boolean => nodePath.isAbsolute(p);
export const joinPath = (...paths: string[]): string => nodePath.join(...paths);
export const getRelativePath = (options: { workingDir: string; path?: string }): string => {
  const { workingDir, path } = options;

  if (!path) {
    return workingDir;
  }

  if (isAbsolutePath(path)) {
    return nodePath.relative(workingDir, path);
  } else {
    return nodePath.relative(workingDir, joinPath(workingDir, path));
  }
};
