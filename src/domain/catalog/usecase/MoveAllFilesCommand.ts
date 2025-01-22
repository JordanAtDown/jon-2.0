type MoveAllFilesCommand = {
  rootDirectory: string;
  destinationDirectory: string;
  extensions: string[];
  batchSize: number;
  idCheckpoint: string;
};

export default MoveAllFilesCommand;
