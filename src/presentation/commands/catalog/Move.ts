import { Command } from 'commander';
import * as TE from 'fp-ts/lib/TaskEither.js';
import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import MoveAndCatalogFileUseCase from '../../../domain/catalog/usecase/MoveAndCatalogFileUseCase.js';
import fastGlobScanner from '../../../infra/shared/filesystem/FastGlobScanner.js';
import {
  createOnCallbacks,
  initializeTrackingView,
} from '../_components/InitializeTrackingView.js';
import { combineValidations } from '../utils/CombineValidations.js';
import {
  validateBatchSize,
  validateDirectoryExists,
  validateExtensions,
} from '../utils/Validations.js';
import { Logger } from '../utils/Logger.js';
import { DateTime } from 'luxon';

const commandsName = 'Move and Catalog';
export const move = new Command('move')
  .description('Move and catalog files')
  .argument('<rootDirectory>', 'source directory')
  .argument('<destinationDirectory>', 'destination directory')
  .argument('<extensions>', 'list of extensions, separated by comma')
  .argument('<batch>', 'size of the batch')
  .action(
    (rootDir: string, destDir: string, extensions: string, batch: string) => {
      const startTime = DateTime.now();
      Logger.info(
        `Début de l'exécution à : ${startTime.toFormat('dd-MM-yyyy HH:mm:ss')}`,
      );
      Logger.info(`Commands ${commandsName}`);
      Logger.info(`Params root dir : ${rootDir}`);
      Logger.info(`Params dest dir : ${destDir}`);
      Logger.info(`Params extensions : ${extensions}`);
      Logger.info(`Params batchSize : ${batch}`);

      pipe(
        validateMoveCommand(rootDir, destDir, extensions, batch),
        E.fold(
          (error) => TE.left(error),
          (validatedParams) =>
            moveAndCatalog(
              validatedParams.rootDirectory,
              validatedParams.destinationDirectory,
              validatedParams.extensions,
              validatedParams.batchSize,
            ),
        ),
        TE.match(
          (error: Error): void => {
            Logger.error(
              `${commandsName} s'est interrompu avec l'erreur : \n ${error.message}`,
            );
            console.error(error.message);
          },
          () => Logger.info(`${commandsName} succés`),
        ),
      )();

      const endTime = DateTime.now();
      const durationMillis = endTime.diff(startTime).toMillis();
      const durationSecs = (durationMillis / 1000).toFixed(2);

      Logger.info(
        `Fin de l'exécution : ${endTime.toFormat('dd-MM-yyyy HH:mm:ss')}`,
      );
      Logger.info(`Durée totale de l'exécution : ${durationSecs} secondes`);
    },
  );

const moveAndCatalog = (
  rootDir: string,
  destDir: string,
  extensions: string,
  batchSize: string,
): TE.TaskEither<Error, void> => {
  const {
    screen,
    progressBarComponent,
    statusETAComponent,
    log,
    statusProcess,
  } = initializeTrackingView();

  const { onItemTrackCallback, onProgressUpdateCallback } = createOnCallbacks(
    progressBarComponent,
    statusETAComponent,
    log,
    screen,
    statusProcess,
  );

  // TODO: Tester les composants
  return new MoveAndCatalogFileUseCase(fastGlobScanner, []).moveAndCatalogFile({
    rootDirectory: rootDir,
    destinationDirectory: destDir,
    extensions: extensions.split(','),
    batchSize: batchSize ? parseInt(batchSize) : 50,
    progress: onProgressUpdateCallback,
    itemCallback: onItemTrackCallback,
  });
};

interface MoveParams {
  rootDirectory: string;
  destinationDirectory: string;
  extensions: string;
  batchSize: string;
}

const validateMoveParams = combineValidations<MoveParams>(
  (params) =>
    pipe(
      params.rootDirectory,
      validateDirectoryExists,
      E.map(() => params),
    ),
  (params) =>
    pipe(
      params.destinationDirectory,
      validateDirectoryExists,
      E.map(() => params),
    ),
  (params) =>
    pipe(
      params.extensions,
      validateExtensions,
      E.map(() => params),
    ),
  (params) =>
    pipe(
      params.batchSize,
      validateBatchSize,
      E.map(() => params),
    ),
);

const validateMoveCommand = (
  rootDirectory: string,
  destinationDirectory: string,
  extensions: string,
  batchSize: string,
): E.Either<Error, MoveParams> => {
  const params: MoveParams = {
    rootDirectory,
    destinationDirectory,
    extensions,
    batchSize,
  };

  return validateMoveParams(params);
};
