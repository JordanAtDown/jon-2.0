import { ProgressCallback } from '../../shared/tracker/Progress.js';
import { ItemCallback } from '../../shared/tracker/ItemTracker.js';

type MergeDuplicateCommand = {
  importFilePath: string;
  idCheckpoint: string;
  progress: ProgressCallback;
  itemCallback: ItemCallback;
};

export default MergeDuplicateCommand;
