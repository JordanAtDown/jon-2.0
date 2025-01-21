type MoveAllFilesCommand = {
  rootDirectory: string;
  extensions: string[];
  batchSize: number;
};

export default MoveAllFilesCommand;
