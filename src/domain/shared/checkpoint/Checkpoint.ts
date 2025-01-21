import * as TE from 'fp-ts/TaskEither';
import CheckpointData from './CheckpointData';
import { Option } from 'fp-ts/Option';

interface Checkpoint {
  findBy(id: string): TE.TaskEither<Error, Option<CheckpointData>>;
  update(
    id: string,
    newProcessedFiles: Set<string>,
  ): TE.TaskEither<Error, CheckpointData>;
}

export default Checkpoint;
