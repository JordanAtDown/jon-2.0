import { Command } from 'commander';
import { DateTime } from 'luxon';
import Logger from '../utils/Logger.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import {
  MergeCommandInput,
  validateMergeParamsInput,
} from './_step/ValidateCopyAllParamsStep.js';
import { initializeUIStep } from '../_step/InitializeUIStep.js';
import { getAppDataPathStep } from '../_step/GetAppDataPathStep.js';
import { databaseConfigurationStep } from '../_step/DatabaseConfigurationStep.js';
import { dbReadyStep } from '../_step/DBReadyStep.js';
import { mergeStep } from './_step/MergeStep.js';
import { closeDB } from '../utils/CloseDB.js';
import { checkpointRepositoryStep } from '../_step/CheckpointRepositoryStep.js';

const commandName = 'Merge';
export const merge = new Command('merge')
  .description('merge path of duplicate files in a new merge path')
  .argument('<filepath>', 'filepath to import (dupeguru csv file)')
  .argument('<idCheckpoint>', 'identifier of checkpoint based on groupid')
  .action((filepath: string, idCheckpoint: string) => {
    const startTime = DateTime.now();
    Logger.info(
      `Début de l'exécution à : ${startTime.toFormat('dd-MM-yyyy HH:mm:ss')}`,
    );
    Logger.info(`Command: ${commandName}`);
    Logger.info(`Params - destination dir: ${filepath}`);
    Logger.info(`Params - checkpoint: ${idCheckpoint}`);

    const mergeCommandInput = {
      filepath,
      idCheckpoint,
    };

    pipe(
      pipeline(mergeCommandInput),
      TE.match(
        (error: Error) => {
          Logger.error(
            `Une erreur est survenue : ${error.message || 'Erreur inconnue'}`,
          );
          console.error(error.message);
        },
        () => {
          Logger.info('Exécuté avec succès !');
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
  });

const pipeline = (input: MergeCommandInput): TE.TaskEither<Error, void> => {
  return pipe(
    // Étape 1 : Validation des paramètres
    validateMergeParamsInput(input),
    TE.chain((validatedInput) =>
      pipe(
        initializeUIStep(),
        TE.chain((trackingCallbacks) =>
          pipe(
            getAppDataPathStep(),
            TE.chain((appDataPath) =>
              pipe(
                databaseConfigurationStep(appDataPath),
                TE.chain((dbConfig) =>
                  pipe(
                    dbReadyStep(dbConfig),
                    TE.chain(() =>
                      pipe(
                        checkpointRepositoryStep(dbConfig),
                        TE.chain((checkpointRepository) =>
                          pipe(
                            mergeStep(
                              {
                                checkpointRepository,
                              },
                              {
                                importFilePath: validatedInput.filepath,
                                idCheckpoint: validatedInput.idCheckpoint,
                                progress:
                                  trackingCallbacks.onProgressUpdateCallback,
                                itemCallback:
                                  trackingCallbacks.onItemTrackCallback,
                              },
                            )(),
                            TE.chain(() => closeDB(dbConfig)),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
};
