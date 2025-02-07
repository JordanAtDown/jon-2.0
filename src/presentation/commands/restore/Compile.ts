import { Command } from 'commander';

interface CompiledOptions {
  idCheckpoint?: string;
  batchSize?: number;
}

export const compiled = new Command('compiled')
  .description('Compiled metadata from filemetadata')
  .option('-b, --batch <batch>', 'size of the batch', '100')
  .option('-i, --id <id>', 'identifier checkpoint', '')
  .action((options: CompiledOptions) => {
    console.log(
      `batch ${options.batchSize} idCheckpoint ${options.idCheckpoint}`,
    );
  });
