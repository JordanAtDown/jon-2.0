import { Command } from 'commander';

interface CopyAllOptions {
  idCheckpoint?: string;
  batchSize?: number;
}

export const copy = new Command('copy')
  .description('Copy all files with compiled metadata to new path')
  .argument('<destination>', 'destination directory')
  .option('-i, --id <id>', 'identifier checkpoint', '')
  .option('-b, --batch <batch>', 'size of the batch', '100')
  .action((destination: string, options: CopyAllOptions) => {
    console.log(
      `checkpoint ${options.idCheckpoint} batch ${options.batchSize}, destination ${destination}`,
    );
  });
