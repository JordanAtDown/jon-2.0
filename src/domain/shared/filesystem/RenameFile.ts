import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { promises as fs } from 'fs';
import * as path from 'path';
import OccurenceIdentifier from '../duplicate/OccurenceIdentifier';

const renameFile = (
  filePath: string,
  newName: string,
  occurenceIdentifier: OccurenceIdentifier,
): TE.TaskEither<Error, string> => {
  return pipe(
    TE.tryCatch(
      async () => {
        const directory = path.dirname(filePath);
        const uniqueName = pipe(
          occurenceIdentifier.generateUniqueIdentifier(newName),
          O.fold(
            () => newName,
            (uniqueId) =>
              `${path.parse(newName).name}-${uniqueId}${path.extname(newName)}`,
          ),
        );

        const newFilePath = path.join(directory, uniqueName);
        await fs.rename(filePath, newFilePath);
        return newFilePath;
      },
      (error) => new Error(`Error while renaming file: ${String(error)}`),
    ),
  );
};

export default renameFile;
