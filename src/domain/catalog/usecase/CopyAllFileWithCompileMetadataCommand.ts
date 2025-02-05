import { ProgressCallback } from '../../shared/tracker/Progress.js';
import { ItemCallback } from '../../shared/tracker/ItemTracker.js';

type CopyAllFileWithCompileMetadataCommand = {
  destinationDir: string;
  idCheckpoint: string;
  batchSize: number;
  progressCallback: ProgressCallback;
  itemCallback: ItemCallback;
};

export default CopyAllFileWithCompileMetadataCommand;
