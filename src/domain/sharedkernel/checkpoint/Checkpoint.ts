import * as TE from 'fp-ts/TaskEither';
import { Option } from 'fp-ts/Option';
import { CheckpointData } from './CheckpointData';

interface Checkpoint {
  create(checkpoint: CheckpointData): TE.TaskEither<Error, CheckpointData>;
  findBy(id: string): TE.TaskEither<Error, Option<CheckpointData>>;
  findCheckpoints(
    filter: Partial<CheckpointData>,
  ): TE.TaskEither<Error, Array<CheckpointData>>;
  update(
    id: string,
    newProcessedFiles: Set<string>,
  ): TE.TaskEither<Error, CheckpointData>;
}

export default Checkpoint;
