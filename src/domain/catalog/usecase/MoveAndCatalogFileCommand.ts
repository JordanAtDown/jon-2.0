type MoveAndCatalogFileCommand = {
  rootDirectory: string;
  destinationDirectory: string;
  extensions: string[];
  batchSize: number;
  format: string;
};

export default MoveAndCatalogFileCommand;
