import { pipe } from 'fp-ts/lib/function.js';
import * as RA from 'fp-ts/lib/ReadonlyArray.js';
import * as O from 'fp-ts/lib/Option.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { DuplicateFile } from './DuplicateFiles.js';

export const safeParse = (
  content: string,
): TE.TaskEither<Error, Array<DuplicateFile>> =>
  TE.tryCatch(
    () => Promise.resolve(parseDupeGuruExport(content)),
    (reason) => new Error(String(reason)),
  );

export const parseDupeGuruExport = (content: string): Array<DuplicateFile> =>
  pipe(
    content.split('\n'),
    RA.dropLeft(1),
    RA.map(parseLine),
    RA.filterMap((x) => x),
    (readonlyArray) => Array.from(readonlyArray),
  );

const SEPARATOR = ',';
const GROUPEID = 0;
const FILENAME = 1;
const FOLDER = 2;
const parseLine = (line: string): O.Option<DuplicateFile> =>
  pipe(line.split(SEPARATOR), (columns) => {
    return columns.length >= 3 &&
      columns[GROUPEID] !== undefined &&
      columns[FILENAME] !== undefined &&
      columns[FOLDER] !== undefined
      ? O.some(
          new DuplicateFile(
            columns[GROUPEID].trim(),
            columns[FILENAME].trim(),
            columns[FOLDER].trim(),
          ),
        )
      : O.none;
  });
