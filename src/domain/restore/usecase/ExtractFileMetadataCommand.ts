import { ProgressCallback } from '../../shared/tracker/Progress.js';
import { ItemCallback } from '../../shared/tracker/ItemTracker.js';

type ExtractFileMetadataCommand = {
  rootDirectory: string;
  extensions: string[];
  batchSize: number;
  idCheckpoint: string;
  progress: ProgressCallback;
  itemCallback: ItemCallback;
};

export default ExtractFileMetadataCommand;
