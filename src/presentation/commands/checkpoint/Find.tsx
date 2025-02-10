import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { Command } from 'commander';
import { AppDataPath } from '../../config/AppDataPath.js';
import DatabaseConfiguration from '../../../infra/shared/config/DatabaseConfiguration.js';
import CheckpointFindUseCase from '../../../domain/checkpoint/usecase/CheckpointFindUseCase.js';
import LokiJSCheckpoint from '../../../infra/sharedkernel/checkpoint/LokiJSCheckpoint.js';
import { render } from 'ink';
import CheckpointList from './_components/CheckpointList.js';
import React from 'react';

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
    pipe(
      findCheckpoint(options),
      // Render Final
      TE.match(
        (error) => console.error(error.message),
        () => console.log('Checkpoint found successfully.'),
      ),
    )();
  });

const findCheckpoint = (options: FindOptions): TE.TaskEither<Error, void> => {
  return pipe(
    // Configuration
    AppDataPath.getInstance().getAppDataPath(),
    TE.chain((appDataPath) =>
      TE.fromEither(DatabaseConfiguration.getInstance(appDataPath)),
    ),
    // Exploitation
    TE.chain((databaseConfig: DatabaseConfiguration) => {
      const usecase = new CheckpointFindUseCase(
        new LokiJSCheckpoint(databaseConfig.checkpointDB),
      );
      return usecase.find({
        id: options.id,
        category: options.category,
        source: options.source,
      });
    }),
    // Render execution Réussi
    TE.map((_) => {
      render(
        <CheckpointList
          checkpoints={[
            { id: 'id', source: '/root', category: 'ID', totalProcessed: 50 },
            { id: '01', source: '/root', category: 'ID', totalProcessed: 50 },
            { id: '45', source: '/root', category: 'ID', totalProcessed: 50 },
            { id: '45', source: '/root', category: 'ID', totalProcessed: 50 },
            { id: '545', source: '/root', category: 'ID', totalProcessed: 50 },
          ]}
        />,
      );
    }),
    // TODO:  Close connexion DB
  );
};
