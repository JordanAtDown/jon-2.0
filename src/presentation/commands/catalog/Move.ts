import { Command } from 'commander';
import {
  MoveCommandInput,
  validateMoveParamsInput,
} from './_step/ValidateMoveParamsStep.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { initializeUIStep } from '../_step/InitializeUIStep.js';
import { moveStep } from './_step/MoveStep.js';
import { DateTime } from 'luxon';
import Logger from '../utils/Logger.js';

const commandName = 'Move and Catalog';
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
      Logger.info(`Command: ${commandName}`);
      Logger.info(`Params - root dir: ${rootDir}`);
      Logger.info(`Params - dest dir: ${destDir}`);
      Logger.info(`Params - extensions: ${extensions}`);
      Logger.info(`Params - batch size: ${batch}`);

      const moveCommandInput = {
        rootDirectory: rootDir,
        destDir,
        extensions,
        batchSize: batch,
      };

      pipe(
        Pipeline(moveCommandInput),
        TE.match(
          (error: Error) => {
            Logger.error(
              `Une erreur est survenue : ${error.message || 'Erreur inconnue'}`,
            );
            console.error(error.message);
          },
          () => {
            Logger.info('Pipeline exécuté avec succès !');
          },
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

const Pipeline = (input: MoveCommandInput): TE.TaskEither<Error, void> => {
  return pipe(
    validateMoveParamsInput(input),
    TE.chain((validatedParams) =>
      pipe(
        initializeUIStep(),
        TE.map((callbacks) => ({
          validatedParams,
          callbacks,
        })),
      ),
    ),

    TE.chain(({ validatedParams, callbacks }) =>
      moveStep({
        rootDirectory: validatedParams.rootDirectory,
        destinationDirectory: validatedParams.destDir,
        extensions: validatedParams.extensions.split(','),
        batchSize: parseInt(validatedParams.batchSize, 10),
        progress: callbacks.onProgressUpdateCallback,
        itemCallback: callbacks.onItemTrackCallback,
      })(),
    ),
  );
};
