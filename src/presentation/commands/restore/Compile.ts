import { pipe } from 'fp-ts/lib/function.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { validateCompileParamsInput } from './_step/ValidateCompileParamsStep.js';
import { CompileMetadataStep } from './_step/CompileMetadataStep.js';
import Logger from '../utils/Logger.js';
import { closeDB } from '../utils/CloseDB.js';
import { DateTime } from 'luxon';
import HashTagGenerator from '../../../infra/shared/tag/HashTagGenerator.js';
import HashDateGenerator from '../../../infra/shared/tag/HashDateGenerator.js';
import { Command } from 'commander';
import { initializeUIStep } from '../_step/InitializeUIStep.js';
import { getAppDataPathStep } from '../_step/GetAppDataPathStep.js';
import { databaseConfigurationStep } from '../_step/DatabaseConfigurationStep.js';
import { dbReadyStep } from '../_step/DBReadyStep.js';
import { fileMetadataRepositoryStep } from '../_step/FileMetadataRepositoryStep.js';
import { metadataCompileRepositoryStep } from '../_step/MetadataCompileRepositoryStep.js';
import { checkpointRepositoryStep } from '../_step/CheckpointRepositoryStep.js';
import { loadDictionariesStep } from '../_step/LoadDictionariesStep.js';
import { CompileMetadataUseCaseCommand } from '../../../domain/restore/usecase/CompileMetadataUseCaseCommand.js';

const commandName = 'Compile Metadata Pipeline';
export const compile = new Command('compile')
  .description('Compile metadata using the defined pipeline')
  .argument('<batchSize>', 'Batch size for processing')
  .argument('<idCheckpoint>', 'Checkpoint ID for retry')
  .action(async (batchSize: string, idCheckpoint: string) => {
    const startTime = DateTime.now();
    Logger.info(
      `Début de l'exécution à : ${startTime.toFormat('dd-MM-yyyy HH:mm:ss')}`,
    );
    Logger.info(`Command: ${commandName}`);
    Logger.info(`Params - batch size: ${batchSize}`);
    Logger.info(`Params - idCheckpoint: ${idCheckpoint}`);

    const compileCommandInput = {
      batchSize,
      idCheckpoint,
    };

    await pipe(
      Pipeline(compileCommandInput),
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

/**
 * Metadata Compile Pipeline
 */
const Pipeline = (compileCommandInput: {
  batchSize: string;
  idCheckpoint: string;
}) =>
  pipe(
    validateCompileParamsInput(compileCommandInput),
    TE.chain(() => initializeUIStep()),
    TE.chain((trackingCallbacks) =>
      pipe(
        getAppDataPathStep(),
        TE.chain((appDataPath) => databaseConfigurationStep(appDataPath)),
        TE.chain((dbConfig) => dbReadyStep(dbConfig)),
        TE.chain((dbConfig) =>
          pipe(
            fileMetadataRepositoryStep(dbConfig),
            TE.map((fileMetadataRepo) => ({
              dbConfig,
              fileMetadataRepo,
              trackingCallbacks,
            })),
          ),
        ),
        TE.chain(({ dbConfig, fileMetadataRepo, trackingCallbacks }) =>
          pipe(
            metadataCompileRepositoryStep(dbConfig),
            TE.chain((metadataCompileRepo) =>
              pipe(
                checkpointRepositoryStep(dbConfig),
                TE.map((checkpointRepo) => ({
                  dbConfig,
                  fileMetadataRepo,
                  metadataCompileRepo,
                  checkpointRepo,
                  trackingCallbacks,
                })),
              ),
            ),
          ),
        ),
        TE.chain(
          ({
            dbConfig,
            fileMetadataRepo,
            metadataCompileRepo,
            checkpointRepo,
            trackingCallbacks,
          }) =>
            pipe(
              loadDictionariesStep(),
              TE.chain((dictionaries) => {
                const compileCommand: CompileMetadataUseCaseCommand = {
                  batchSize: Number(compileCommandInput.batchSize),
                  idCheckpoint: compileCommandInput.idCheckpoint,
                  progressCallback: trackingCallbacks.onProgressUpdateCallback,
                  itemCallback: trackingCallbacks.onItemTrackCallback,
                };

                const compileDependencies = {
                  fileMetadataRepository: fileMetadataRepo,
                  compiledMetadataRepository: metadataCompileRepo,
                  checkpointRepository: checkpointRepo,
                  tagsGenerator: new HashTagGenerator(dictionaries.tags),
                  dateGenerator: new HashDateGenerator(dictionaries.dates),
                };

                return CompileMetadataStep(
                  compileDependencies,
                  compileCommand,
                )();
              }),
              TE.map(() => dbConfig),
            ),
        ),

        // 9. Close all the databases at the end
        TE.chainFirst((dbConfig) => closeDB(dbConfig)),
      ),
    ),
  );
