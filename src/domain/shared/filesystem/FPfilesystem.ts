import * as TE from 'fp-ts/TaskEither';
import { tryCatchTask } from '../utils/fp/FP.js';
import { promises as fs } from 'fs';

export const ensureDirExists = (dirPath: string): TE.TaskEither<Error, void> =>
  tryCatchTask(() =>
    fs.mkdir(dirPath, { recursive: true }).then(() => undefined),
  );

export const copyFile = (
  src: string,
  dest: string,
): TE.TaskEither<Error, void> => tryCatchTask(() => fs.copyFile(src, dest));

export const deleteFile = (src: string): TE.TaskEither<Error, void> =>
  tryCatchTask(() => fs.unlink(src));

export const readFile = (filePath: string): TE.TaskEither<Error, string> =>
  tryCatchTask(async () => {
    return await fs.readFile(filePath, 'utf-8');
  });
