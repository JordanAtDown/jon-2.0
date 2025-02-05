import { ProgressCallback } from '../../shared/tracker/Progress.js';
import { ItemCallback } from '../../shared/tracker/ItemTracker.js';

type MoveAndCatalogFileCommand = {
  rootDirectory: string;
  destinationDirectory: string;
  extensions: string[];
  batchSize: number;
  progress: ProgressCallback;
  itemCallback: ItemCallback;
};

export default MoveAndCatalogFileCommand;
