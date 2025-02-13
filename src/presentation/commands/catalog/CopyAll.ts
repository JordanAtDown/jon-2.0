import { Command } from 'commander';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import {
  CopyCommandInput,
  validateCopyAllParamsInput,
} from './_step/ValidateCopyAllParamsStep.js';
import { getAppDataPathStep } from '../_step/GetAppDataPathStep.js';
import { databaseConfigurationStep } from '../_step/DatabaseConfigurationStep.js';
import { dbReadyStep } from '../_step/DBReadyStep.js';
import { checkpointRepositoryStep } from '../_step/CheckpointRepositoryStep.js';
import { metadataRepositoryStep } from '../_step/MetadataRepositoryStep.js';
import { copyAllStep } from './_step/CopyAllStep.js';
import { DateTime } from 'luxon';
import Logger from '../utils/Logger.js';
import { initializeUIStep } from '../_step/InitializeUIStep.js';
import { closeDB } from '../utils/CloseDB.js';

const commandName = 'Copy All';
export const copy = new Command('copy')
  .description('Copy all files with compiled metadata to new path')
  .argument('<destination>', 'destination directory')
  .argument('<idCheckpoint>', 'identifier checkpoint')
  .argument('<batchSize>', 'size of the batch')
  .action((destination: string, idCheckpoint: string, batchSize: string) => {
    const startTime = DateTime.now();
    Logger.info(
      `Début de l'exécution à : ${startTime.toFormat('dd-MM-yyyy HH:mm:ss')}`,
    );
    Logger.info(`Command: ${commandName}`);
    Logger.info(`Params - destination dir: ${destination}`);
    Logger.info(`Params - checkpoint: ${idCheckpoint}`);
    Logger.info(`Params - batch size: ${batchSize}`);

    const copyCommandInput = {
      destDir: destination,
      idCheckpoint,
      batchSize,
    };

    pipe(
      pipeline(copyCommandInput),
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
  });

const pipeline = (input: CopyCommandInput): TE.TaskEither<Error, void> => {
  return pipe(
    validateCopyAllParamsInput(input),
    TE.chain(() => getAppDataPathStep()),
    TE.chain((appDataPath) => databaseConfigurationStep(appDataPath)),
    TE.chain((dbConfig) =>
      pipe(
        dbReadyStep(dbConfig),
        TE.map(() => dbConfig),
      ),
    ),
    TE.chain((dbConfig) =>
      pipe(
        initializeUIStep(),
        TE.map((trackingCallbacks) => ({ dbConfig, trackingCallbacks })),
      ),
    ),
    TE.chain(({ dbConfig, trackingCallbacks }) =>
      pipe(
        checkpointRepositoryStep(dbConfig),
        TE.map((checkpointRepository) => ({
          dbConfig,
          checkpointRepository,
          trackingCallbacks,
        })),
      ),
    ),
    TE.chain(({ dbConfig, checkpointRepository, trackingCallbacks }) =>
      pipe(
        metadataRepositoryStep(dbConfig),
        TE.map((metadataRepository) => ({
          dbConfig,
          dependencies: { checkpointRepository, metadataRepository },
          trackingCallbacks,
        })),
      ),
    ),
    TE.chain(({ dbConfig, dependencies, trackingCallbacks }) =>
      pipe(
        copyAllStep(dependencies, {
          destinationDir: input.destDir,
          idCheckpoint: input.idCheckpoint,
          batchSize: parseInt(input.batchSize, 10),
          progressCallback: trackingCallbacks.onProgressUpdateCallback,
          itemCallback: trackingCallbacks.onItemTrackCallback,
        })(),
        TE.map(() => dbConfig),
      ),
    ),
    TE.chain((dbConfig) => closeDB(dbConfig)),
  );
};
