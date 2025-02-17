import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as R from 'fp-ts/Record';
import { fold } from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
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
