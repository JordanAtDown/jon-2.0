import * as TE from 'fp-ts/TaskEither';
import CheckpointFindCommand from './CheckpointFindCommand.js';
import { CheckpointData } from '../../sharedkernel/checkpoint/CheckpointData.js';
import Checkpoint from '../../sharedkernel/checkpoint/Checkpoint.js';

class CheckpointFindUseCase {
  private readonly checkpoint: Checkpoint;

  constructor(checkpoint: Checkpoint) {
    this.checkpoint = checkpoint;
  }

  public find(
    command: CheckpointFindCommand,
  ): TE.TaskEither<Error, Array<CheckpointData>> {
    return this.checkpoint.findCheckpoints({ id: command.id });
  }
}

export default CheckpointFindUseCase;
