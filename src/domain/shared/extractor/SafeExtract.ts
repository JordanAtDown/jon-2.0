import * as TE from 'fp-ts/lib/TaskEither.js';
import { Task } from 'fp-ts/lib/Task.js';
import { none, Option, some } from 'fp-ts/lib/Option.js';
import { pipe } from 'fp-ts/lib/function.js';
import FileMetadata from '../../sharedkernel/metadata/FileMetadata.js';

type Extractor = (filePath: string) => TE.TaskEither<Error, FileMetadata>;

export const safeExtract = (
  extract: Extractor,
  filePath: string,
): Task<Option<FileMetadata>> => {
  return pipe(
    extract(filePath),
    TE.match(
      (_error: Error) => {
        return none;
      },
      (fileMetadata) => {
        return some(fileMetadata);
      },
    ),
  );
};

export default safeExtract;
