import Checkpoint from '../../sharedkernel/checkpoint/Checkpoint';
import { CheckpointCreateCommand } from './CheckpointCreateCommand';

class CheckpointCreateUseCase {
  private readonly checkpoint: Checkpoint;

  constructor(checkpoint: Checkpoint) {
    this.checkpoint = checkpoint;
  }

  /**
   * Creates a command for a checkpoint.
   *
   * Example:
   * ```typescript
   * const dbCommand = CheckpointDBCreateCommand('database-123');
   * ```
   *
   * ```typescript
   * const dirCommand = CheckpointDirectoryCreateCommand('/root/directory');
   * ```
   *
   * @param command - The command for creating checkpoint
   * @returns void
   */
  public create(command: CheckpointCreateCommand): void {
    this.checkpoint.create({
      _id: '',
      source: command.source,
      category: command.category,
      lastUpdate: new Date(),
      processed: [],
    });
  }
}

export default CheckpointCreateUseCase;
