import { Command } from 'commander';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { AppDataPath } from '../../config/AppDataPath.js';
import DatabaseConfiguration from '../../../infra/shared/config/DatabaseConfiguration.js';
import MoveAndCatalogFileUseCase from '../../../domain/catalog/usecase/MoveAndCatalogFileUseCase.js';
import fastGlobScanner from '../../../infra/shared/filesystem/FastGlobScanner.js';
import { trackItem, trackProgress } from '../utils/Tracker.js';

interface MoveOptions {
  batchSize?: number;
}

export const move = new Command('move')
  .description('Move and catalog files')
  .argument('<rootDirectory>', 'source directory')
  .argument('<destinationDirectory>', 'destination directory')
  .argument('<extensions>', 'list of extensions, separated by comma')
  .option('-b, --batch <batch>', 'size of the batch', '100')
  .action(
    (
      rootDir: string,
      destDir: string,
      extensions: string,
      options: MoveOptions,
    ) => {
      pipe(
        moveAndCatalog(rootDir, destDir, extensions, options),
        TE.match(
          (error) => console.error(error.message),
          () => console.log('Checkpoint found successfully.'),
        ),
      )();
    },
  );

const moveAndCatalog = (
  rootDir: string,
  destDir: string,
  extensions: string,
  options: MoveOptions,
): TE.TaskEither<Error, void> => {
  return pipe(
    // Validation des paramètres
    // Configuration
    AppDataPath.getInstance().getAppDataPath(),
    TE.chain((appDataPath) =>
      TE.fromEither(DatabaseConfiguration.getInstance(appDataPath)),
    ),
    // Exploitation
    TE.chain((databaseConfig: DatabaseConfiguration) => {
      const usecase = new MoveAndCatalogFileUseCase(fastGlobScanner, []);
      return usecase.moveAndCatalogFile({
        rootDirectory: rootDir,
        destinationDirectory: destDir,
        extensions: [],
        batchSize: 50,
        progress: trackProgress,
        itemCallback: trackItem,
      });
    }),
    // TODO:  Close connexion DB
  );
};
