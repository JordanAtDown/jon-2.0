import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { promises as fs } from 'fs';
import path from 'path';
import { tryCatchTask } from '../utils/fp/FP.js';
import { copyFile, deleteFile, ensureDirExists } from './FPfilesystem.js';

export type DestinationPath = {
  path: string;
};

const moveFile = (
  filepath: string,
  destDir: string,
  withRemove: boolean = false,
): TE.TaskEither<Error, DestinationPath> => {
  return pipe(
    findUniqueFilePath(destDir),
    TE.chain((uniqueDestPath) =>
      pipe(
        ensureDirExists(path.dirname(uniqueDestPath)),
        TE.chain(() => copyFile(filepath, uniqueDestPath)),
        TE.chain(() =>
          withRemove ? deleteFile(filepath) : TE.right(undefined),
        ),
        TE.map(() => ({ path: uniqueDestPath })),
      ),
    ),
  );
};

const getUniqueFilePath = (filePath: string, suffix: number): string => {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  return path.join(dir, `${baseName}_${suffix}${ext}`);
};

const fileExists = (filePath: string): TE.TaskEither<Error, boolean> =>
  tryCatchTask(() =>
    fs
      .access(filePath)
      .then(() => true)
      .catch(() => false),
  );

const findUniqueFilePath = (
  destFilePath: string,
  suffix: number = 1,
): TE.TaskEither<Error, string> =>
  pipe(
    fileExists(destFilePath),
    TE.chain((exists) =>
      exists
        ? findUniqueFilePath(
            getUniqueFilePath(destFilePath, suffix),
            suffix + 1,
          )
        : TE.right(destFilePath),
    ),
  );

export default moveFile;
