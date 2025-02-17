import { pipe } from 'fp-ts/lib/function.js';
import * as A from 'fp-ts/lib/Array.js';
import * as R from 'fp-ts/lib/Record.js';
import { fold } from 'fp-ts/lib/Option.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { DuplicateFile, DuplicateFiles } from './DuplicateFiles.js';

export const safeGroupBy = (
  files: DuplicateFile[],
): TE.TaskEither<Error, Record<string, DuplicateFiles>> =>
  TE.tryCatch(
    () => Promise.resolve(groupBy(files)),
    (reason) => new Error(String(reason)),
  );

export const groupBy = (
  files: Array<DuplicateFile>,
): Record<string, DuplicateFiles> => {
  return pipe(
    files,
    A.reduce({} as Record<string, DuplicateFiles>, (acc, file) =>
      pipe(
        R.lookup(file.id, acc),
        fold(
          () => ({
            ...acc,
            [file.id]: new DuplicateFiles([file]),
          }),
          (existing) => ({
            ...acc,
            [file.id]: new DuplicateFiles([...existing.files, file]),
          }),
        ),
      ),
    ),
  );
};
