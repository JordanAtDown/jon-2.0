type MoveAndCatalogFileCommand = {
  rootDirectory: string;
  destinationDirectory: string;
  extensions: string[];
  batchSize: number;
};

export default MoveAndCatalogFileCommand;
