type ExtractFileMetadataCommand = {
  rootDirectory: string;
  extensions: string[];
  batchSize: number;
  idCheckpoint: string;
};

export default ExtractFileMetadataCommand;
