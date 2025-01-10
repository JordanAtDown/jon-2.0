import { promises as fs } from 'fs';
import * as TE from 'fp-ts/TaskEither';

const tryCatchTask = <T>(task: () => Promise<T>): TE.TaskEither<Error, T> =>
  TE.tryCatch(task, (reason) => new Error(String(reason)));

export const isFile = (filePath: string): TE.TaskEither<Error, boolean> =>
  tryCatchTask(async () => {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  });

export const isDirectory = (path: string): TE.TaskEither<Error, boolean> =>
  tryCatchTask(async () => {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  });

export const readDirectory = (
  directory: string,
): TE.TaskEither<Error, string[]> => tryCatchTask(() => fs.readdir(directory));
