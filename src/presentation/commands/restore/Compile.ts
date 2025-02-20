import { pipe } from 'fp-ts/lib/function.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { validateCompileParamsInput } from './_step/ValidateCompileParamsStep.js';
import { CompileMetadataStep } from './_step/CompileMetadataStep.js';
import { setLogConsoleMode } from '../utils/Logger.js';
import { closeDB } from '../utils/CloseDB.js';
import HashTagGenerator from '../../../infra/shared/tag/HashTagGenerator.js';
import HashDateGenerator from '../../../infra/shared/tag/HashDateGenerator.js';
import { Command } from 'commander';
import { getAppDataPathStep } from '../_step/GetAppDataPathStep.js';
import { databaseConfigurationStep } from '../_step/DatabaseConfigurationStep.js';
import { dbReadyStep } from '../_step/DBReadyStep.js';
import { fileMetadataRepositoryStep } from '../_step/FileMetadataRepositoryStep.js';
import { metadataCompileRepositoryStep } from '../_step/MetadataCompileRepositoryStep.js';
import { checkpointRepositoryStep } from '../_step/CheckpointRepositoryStep.js';
import { loadDictionariesStep } from '../_step/LoadDictionariesStep.js';
import { CompileMetadataUseCaseCommand } from '../../../domain/restore/usecase/CompileMetadataUseCaseCommand.js';
import { onItemTrackLog } from '../_components/OnItemTrackLog.js';
import { onProgressLog } from '../_components/OnProgressLog.js';

export const compile = new Command('compile')
  .description('Compile metadata using the defined pipeline')
  .argument('<batchSize>', 'Batch size for processing')
  .argument('<idCheckpoint>', 'Checkpoint ID for retry')
  .option('--console-mode', 'enable console log mode')
  .action(
    async (
      batchSize: string,
      idCheckpoint: string,
      options: { consoleMode?: boolean },
    ) => {
      setLogConsoleMode(options.consoleMode || false);
      const compileCommandInput = {
        batchSize,
        idCheckpoint,
      };

      await pipe(
        Pipeline(compileCommandInput),
        TE.match(
          (error: Error) => {
            console.error(error.message);
          },
          () => {
            console.info('Success');
          },
        ),
      )();
    },
  );

const Pipeline = (compileCommandInput: {
  batchSize: string;
  idCheckpoint: string;
}) =>
  pipe(
    validateCompileParamsInput(compileCommandInput),
    TE.chain((compileCommandInput) =>
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
            })),
          ),
        ),
        TE.chain(({ dbConfig, fileMetadataRepo }) =>
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
          }) =>
            pipe(
              loadDictionariesStep(),
              TE.chain((dictionaries) => {
                const compileCommand: CompileMetadataUseCaseCommand = {
                  batchSize: Number(compileCommandInput.batchSize),
                  idCheckpoint: compileCommandInput.idCheckpoint,
                  progressCallback: onProgressLog,
                  itemCallback: onItemTrackLog,
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
        TE.chainFirst((dbConfig) => closeDB(dbConfig)),
      ),
    ),
  );
