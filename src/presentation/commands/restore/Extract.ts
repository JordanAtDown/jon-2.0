import { Command } from 'commander';

interface ExtractOptions {
  idCheckpoint?: string;
  batchSize?: number;
}

export const extract = new Command('extract')
  .description('Extract filemetadata from files')
  .argument('<rootDirectory>', 'source directory')
  .argument('<extensions>', 'list of extensions, separated by comma')
  .option('-i, --id <id>', 'identifier checkpoint', '')
  .option('-b, --batch <batch>', 'size of the batch', '100')
  .action(
    (rootDirectory: string, extensions: string, options: ExtractOptions) => {
      console.log(
        `batch ${options.batchSize} id ${options.idCheckpoint} rootDir ${rootDirectory} extensions ${extensions.split(',')}`,
      );
    },
  );
