import * as TE from 'fp-ts/lib/TaskEither.js';
import { Task } from 'fp-ts/lib/Task.js';
import { none, Option, some } from 'fp-ts/lib/Option.js';
import { pipe } from 'fp-ts/lib/function.js';
import FileMetadata from '../../sharedkernel/metadata/FileMetadata.js';
import { ItemState, ItemTracker } from '../tracker/ItemTracker.js';
import { ItemTrackerBuilder } from '../tracker/ItemTrackBuilder.js';

type Extractor = (filePath: string) => TE.TaskEither<Error, FileMetadata>;

export const safeExtract = (
  extract: Extractor,
  filePath: string,
  itemTracker: ItemTracker,
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
        itemTracker.track(
          ItemTrackerBuilder.start()
            .withId(fileMetadata.fullPath)
            .asNormalItem(ItemState.PROCESS),
        );
        return some(fileMetadata);
      },
    ),
  );
};

export default safeExtract;
