import { Command } from 'commander';
import { pipe } from 'fp-ts/lib/function.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { getAppDataPathStep } from '../_step/GetAppDataPathStep.js';
import { databaseConfigurationStep } from '../_step/DatabaseConfigurationStep.js';
import { dbReadyStep } from '../_step/DBReadyStep.js';
import { fileMetadataRepositoryStep } from '../_step/FileMetadataRepositoryStep.js';
import { checkpointRepositoryStep } from '../_step/CheckpointRepositoryStep.js';
import {
  ExtractCommandInput,
  validateExtractParamsInput,
} from './_step/ValidateExtractParamsStep.js';
import { initializeUIStep } from '../_step/InitializeUIStep.js';
import { ExtractMetadataStep } from './_step/ExtractMetadataStep.js';
import ExtractFileMetadataCommand from '../../../domain/restore/usecase/ExtractFileMetadataCommand.js';
import { DateTime } from 'luxon';
import Logger from '../utils/Logger.js';
import { closeDB } from '../utils/CloseDB.js';

const commandName = 'Extract FileMetadata';
export const extract = new Command('extract')
  .description('Extract metadata from files in a directory')
  .argument('<rootDirectory>', 'source directory to scan')
  .argument(
    '<extensions>',
    'list of extensions, separated by comma (e.g., video,image,jpg)',
  )
  .argument('<batchSize>', 'batch size for processing')
  .argument('<idCheckpoint>', 'ID for checkpoint tracking')
  .action(
    async (
      rootDirectory: string,
      extensions: string,
      batchSize: string,
      idCheckpoint: string,
    ) => {
      const startTime = DateTime.now();
      Logger.info(
        `Début de l'exécution à : ${startTime.toFormat('dd-MM-yyyy HH:mm:ss')}`,
      );
      Logger.info(`Command: ${commandName}`);
      Logger.info(`Params - root dir: ${rootDirectory}`);
      Logger.info(`Params - extensions: ${extensions}`);
      Logger.info(`Params - batch size: ${batchSize}`);
      Logger.info(`Params - idCheckpoint: ${idCheckpoint}`);

      const extractCommandInput = {
        rootDirectory,
        extensions,
        batchSize,
        idCheckpoint,
      };

      await pipe(
        Pipeline(extractCommandInput),
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

const Pipeline = (extractCommandInput: ExtractCommandInput) =>
  pipe(
    validateExtractParamsInput({
      rootDirectory: extractCommandInput.rootDirectory,
      extensions: extractCommandInput.extensions,
      batchSize: extractCommandInput.batchSize,
      idCheckpoint: extractCommandInput.idCheckpoint,
    }),
    TE.chain((validInput) =>
      pipe(
        initializeUIStep(),
        TE.chain((trackingCallbacks) =>
          pipe(
            getAppDataPathStep(),
            TE.chain((appDataPath) => databaseConfigurationStep(appDataPath)),
            TE.chain((dbConfig) =>
              pipe(
                dbReadyStep(dbConfig),
                TE.chain(() =>
                  pipe(
                    fileMetadataRepositoryStep(dbConfig),
                    TE.chain((fileMetadataRepo) =>
                      pipe(
                        checkpointRepositoryStep(dbConfig),
                        TE.map((checkpointRepo) => ({
                          fileMetadataRepo,
                          checkpointRepo,
                          trackingCallbacks,
                          validInput,
                          dbConfig,
                        })),
                      ),
                    ),
                  ),
                ),
                TE.chain((context) => {
                  const command: ExtractFileMetadataCommand = {
                    rootDirectory: context.validInput.rootDirectory,
                    extensions: context.validInput.extensions.split(','),
                    batchSize: parseInt(context.validInput.batchSize, 10),
                    idCheckpoint: context.validInput.idCheckpoint,
                    progress:
                      context.trackingCallbacks.onProgressUpdateCallback,
                    itemCallback: context.trackingCallbacks.onItemTrackCallback,
                  };

                  return pipe(
                    ExtractMetadataStep(
                      {
                        fileMetadataRepository: context.fileMetadataRepo,
                        checkpointRepository: context.checkpointRepo,
                      },
                      command,
                    )(),
                    TE.map(() => context.dbConfig),
                  );
                }),
                TE.chain((dbconfig) => closeDB(dbconfig)),
              ),
            ),
          ),
        ),
      ),
    ),
  );
