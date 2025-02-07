import * as TE from 'fp-ts/lib/TaskEither.js';
import CheckpointFindCommand from './CheckpointFindCommand.js';
import { CheckpointData } from '../../sharedkernel/checkpoint/CheckpointData.js';
import Checkpoint from '../../sharedkernel/checkpoint/Checkpoint.js';

export class CheckpointFindUseCase {
  private readonly checkpoint: Checkpoint;

  constructor(checkpoint: Checkpoint) {
    this.checkpoint = checkpoint;
  }

  public find(
    command: CheckpointFindCommand,
  ): TE.TaskEither<Error, Array<CheckpointData>> {
    return this.checkpoint.findCheckpoints({
      id: command.id,
      category: command.category,
      source: command.source,
    });
  }
}

export default CheckpointFindUseCase;
