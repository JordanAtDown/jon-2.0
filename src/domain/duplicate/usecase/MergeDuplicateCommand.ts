import { ProgressCallback } from '../../shared/tracker/Progress.js';

type MergeDuplicateCommand = {
  rootPath: string;
  importFilePath: string;
  progress: ProgressCallback;
};

export default MergeDuplicateCommand;
