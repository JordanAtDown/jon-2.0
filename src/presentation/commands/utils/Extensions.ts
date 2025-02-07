import { Command } from 'commander';
import EXTENSIONS from '../../../domain/shared/filesystem/Extensions.js';

export const extensions = new Command('extensions')
  .description('List all extensions supported by commands')
  .action(() => {
    Object.entries(EXTENSIONS).forEach(([key, value]) => {
      console.log(`${key}: ${value.join(', ')}`);
    });
  });
