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
import { ExtractMetadataStep } from './_step/ExtractMetadataStep.js';
import ExtractFileMetadataCommand from '../../../domain/restore/usecase/ExtractFileMetadataCommand.js';
import { closeDB } from '../utils/CloseDB.js';
import { setLogConsoleMode } from '../utils/Logger.js';

export const extract = new Command('extract')
  .description('Extract metadata from files in a directory')
  .argument('<rootDirectory>', 'source directory to scan')
  .argument(
    '<extensions>',
    'list of extensions, separated by comma (e.g., video,image,jpg)',
  )
  .argument('<batchSize>', 'batch size for processing')
  .argument('<idCheckpoint>', 'ID for checkpoint tracking')
  .option('--console-mode', 'enable console log mode')
  .action(
    async (
      rootDirectory: string,
      extensions: string,
      batchSize: string,
      idCheckpoint: string,
      options: { consoleMode?: boolean },
    ) => {
      setLogConsoleMode(options.consoleMode || true);
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
            console.error(error.message);
          },
          () => {
            console.info('Success');
          },
        ),
      )();
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
  );
