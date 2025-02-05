import { ProgressCallback } from '../../shared/tracker/Progress.js';
import { ItemCallback } from '../../shared/tracker/ItemTracker.js';

export type CompileMetadataUseCaseCommand = {
  batchSize: number;
  idCheckpoint: string;
  progressCallback: ProgressCallback;
  itemCallback: ItemCallback;
};
