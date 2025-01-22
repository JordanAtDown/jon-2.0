import CheckpointFindCommand from './CheckpointFindCommand';
import Checkpoint from '../../sharedkernel/checkpoint/Checkpoint';
import * as TE from 'fp-ts/TaskEither';
import { CheckpointData } from '../../sharedkernel/checkpoint/CheckpointData';

class CheckpointFindUseCase {
  private readonly checkpoint: Checkpoint;

  constructor(checkpoint: Checkpoint) {
    this.checkpoint = checkpoint;
  }

  public find(
    command: CheckpointFindCommand,
  ): TE.TaskEither<Error, Array<CheckpointData>> {
    return this.checkpoint.findCheckpoints(command.filter);
  }
}
