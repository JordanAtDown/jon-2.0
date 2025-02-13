import { Command } from 'commander';

interface FindOptions {
  id?: string | undefined;
  category?: string | undefined;
  source?: string | undefined;
}

export const find = new Command('find')
  .description('Find a checkpoint')
  .option('-i, --id <id>', 'identifier', undefined)
  .option('-c, --category <category>', 'category ("ID" or "DIR")', undefined)
  .option(
    '-s, --source <source>',
    'source of checkpoint (root folder "/path/ro/folder/root" or "DB" Filemetadata, Compiledmetadata)',
    undefined,
  )
  .action((options: FindOptions) => {
    console.log(options);
  });
