import { ProgressCallback } from '../../shared/tracker/Progress';

type ExtractFileMetadataCommand = {
  rootDirectory: string;
  extensions: string[];
  batchSize: number;
  idCheckpoint: string;
  progress: ProgressCallback;
};

export default ExtractFileMetadataCommand;
