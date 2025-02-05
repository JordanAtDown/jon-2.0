import * as TE from 'fp-ts/TaskEither';
import { Option } from 'fp-ts/Option';
import { AggregatedCheckpointData, CheckpointData } from './CheckpointData.js';

export type FilterCheckpoint = {
  id: string;
};

interface Checkpoint {
  save(
    checkpoint: CheckpointData,
  ): TE.TaskEither<Error, Option<CheckpointData>>;
  findBy(id: string): TE.TaskEither<Error, Option<AggregatedCheckpointData>>;
  findCheckpoints(
    filter: FilterCheckpoint,
  ): TE.TaskEither<Error, Array<AggregatedCheckpointData>>;
}

export default Checkpoint;
