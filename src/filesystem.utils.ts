import { tryCatchTask } from './fp.utils';
import { promises as fs } from 'fs';
import * as TE from 'fp-ts/TaskEither';

export const isFile = (filePath: string): TE.TaskEither<Error, boolean> =>
  tryCatchTask(async () => {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  });

// Vérifie si un chemin est un répertoire
export const isDirectory = (path: string): TE.TaskEither<Error, boolean> =>
  tryCatchTask(async () => {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  });

// Lit le contenu d'un répertoire
export const readDirectory = (
  directory: string,
): TE.TaskEither<Error, string[]> => tryCatchTask(() => fs.readdir(directory));
