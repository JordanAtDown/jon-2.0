#!/usr/bin/env node
import { Command } from 'commander';
import commandsCheckpoint from './presentation/commands/checkpoint/Index.js';
import commandsCatalog from './presentation/commands/catalog/Index.js';
import commandsRestore from './presentation/commands/restore/Index.js';
import commandsUtils from './presentation/commands/utils/Index.js';
import commandsDuplicate from './presentation/commands/duplicate/Index.js';
import packageJson from '../package.json';

const program = new Command();

program
  .name('Jon-2.0')
  .description('Cli for managing photo library')
  .version(packageJson.version);

const checkpoint = program
  .command('checkpoint')
  .description('Manage checkpoints');
commandsCheckpoint.forEach((command) => checkpoint.addCommand(command));

const catalog = program
  .command('catalog')
  .description('Move and copy photo library');
commandsCatalog.forEach((command) => catalog.addCommand(command));

const restore = program
  .command('restore')
  .description('Extract, compiled for restored photo library');
commandsRestore.forEach((command) => restore.addCommand(command));

const duplicate = program
  .command('duplicate')
  .description('Manage of duplicate files');
commandsDuplicate.forEach((command) => duplicate.addCommand(command));

const utils = program.command('utils').description('Manage checkpoints');
commandsUtils.forEach((command) => utils.addCommand(command));

program.parse();
