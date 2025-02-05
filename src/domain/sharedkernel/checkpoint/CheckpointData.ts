import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

type CheckpointData = {
  _id: string;
  category: CategorySource;
  lastUpdate: DateTime;
  source: string;
  processed: Set<string>;
};

type AggregatedCheckpointData = {
  _id: string;
  category: CategorySource;
  lastUpdate: DateTime;
  source: string;
  processed: Set<string>;
};

enum CategorySource {
  Dir = 'DIR',
  ID = 'ID',
}

const DefaultCheckpointDataFileMetadata: CheckpointData = {
  _id: uuidv4(),
  category: CategorySource.ID,
  lastUpdate: DateTime.now(),
  source: 'Filemetadata',
  processed: new Set(),
};

const DefaultCheckpointDataCompiledMetadata: CheckpointData = {
  _id: uuidv4(),
  category: CategorySource.ID,
  lastUpdate: DateTime.now(),
  source: 'CompiledMetadata',
  processed: new Set(),
};

type CheckpointDetails = {
  id: string;
  processed: Set<string>;
  source: string;
};

const resolveDefaultCheckpoint = (
  optionAggrCheckpoint: O.Option<CheckpointData>,
  defaultCheckpoint: CheckpointData,
): TE.TaskEither<Error, CheckpointDetails> =>
  pipe(
    optionAggrCheckpoint,
    O.match(
      () =>
        TE.of<Error, CheckpointDetails>({
          id: defaultCheckpoint._id,
          processed: defaultCheckpoint.processed,
          source: defaultCheckpoint.source,
        }),
      (aggregatedCheckpointData) =>
        TE.of<Error, CheckpointDetails>({
          id: aggregatedCheckpointData._id,
          processed: aggregatedCheckpointData.processed,
          source: aggregatedCheckpointData.source,
        }),
    ),
  );

export {
  CheckpointData,
  resolveDefaultCheckpoint,
  CategorySource,
  CheckpointDetails,
  AggregatedCheckpointData,
  DefaultCheckpointDataCompiledMetadata,
  DefaultCheckpointDataFileMetadata,
};
