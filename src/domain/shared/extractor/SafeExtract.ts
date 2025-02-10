import * as TE from 'fp-ts/lib/TaskEither.js';
import { Task } from 'fp-ts/lib/Task.js';
import { none, Option, some } from 'fp-ts/lib/Option.js';
import { pipe } from 'fp-ts/lib/function.js';
import FileMetadata from '../../sharedkernel/metadata/FileMetadata.js';
import { ItemTrackerBuilder } from '../tracker/ItemTrackBuilder.js';
import WrapperMutableItemTracker from '../tracker/WrapperMutableItemTracker.js';

type Extractor = (filePath: string) => TE.TaskEither<Error, FileMetadata>;

export const safeExtract = (
  extract: Extractor,
  filePath: string,
  itemTracker: WrapperMutableItemTracker,
): Task<Option<FileMetadata>> => {
  return pipe(
    extract(filePath),
    TE.match(
      (error: Error) => {
        itemTracker.track(
          ItemTrackerBuilder.start()
            .withId(filePath)
            .asErrorItem(error.message)
            .build(),
        );
        return none;
      },
      (fileMetadata) => {
        return some(fileMetadata);
      },
    ),
  );
};

export default safeExtract;
