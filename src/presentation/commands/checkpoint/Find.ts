import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { Command } from 'commander';
import { AppDataPath } from '../../config/AppDataPath.js';
import DatabaseConfiguration from '../../../infra/shared/config/DatabaseConfiguration.js';
import CheckpointFindUseCase from '../../../domain/checkpoint/usecase/CheckpointFindUseCase.js';
import LokiJSCheckpoint from '../../../infra/sharedkernel/checkpoint/LokiJSCheckpoint.js';

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
    // Render
    TE.map((checkpoints) => {
      if (checkpoints.length === 0) {
        console.log('Aucun checkpoints');
      } else {
        console.log('Liste des checkpoints trouvés :');
        checkpoints.forEach((checkpoint, index) => {
          console.log(`Checkpoint ${index + 1}:`, checkpoint);
        });
      }
    }),
    // TODO:  Close connexion DB
  );
};
