import { Command } from 'commander';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { cpus } from 'os';
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
import { setLogConsoleMode } from '../utils/Logger.js';
import { closeDB } from '../utils/CloseDB.js';
import { setMaxProcs } from '../../../domain/shared/exif/ExifWriting.js';

const numCores = cpus().length;
const defaultProcs = Math.max(1, Math.floor(numCores * 0.8));

export const copy = new Command('copy')
  .description('Copy all files with compiled metadata to new path')
  .argument('<destination>', 'destination directory')
  .argument('<idCheckpoint>', 'identifier checkpoint')
  .argument('<batchSize>', 'size of the batch')
  .option('--console-mode', 'enable console log mode')
  .option(
    '-p, --procs <number>',
    `number of processes to use (default: ${defaultProcs})`,
  )
  .action(
    (
      destination: string,
      idCheckpoint: string,
      batchSize: string,
      options: { consoleMode?: boolean; procs?: string },
    ) => {
      setLogConsoleMode(options.consoleMode || true);
      const procs = options.procs ? parseInt(options.procs, 10) : defaultProcs;
      setMaxProcs(procs);

      const copyCommandInput = {
        destDir: destination,
        idCheckpoint,
        batchSize,
      };

      pipe(
        pipeline(copyCommandInput),
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
        checkpointRepositoryStep(dbConfig),
        TE.map((checkpointRepository) => ({
          dbConfig,
          checkpointRepository,
        })),
      ),
    ),
    TE.chain(({ dbConfig, checkpointRepository }) =>
      pipe(
        metadataRepositoryStep(dbConfig),
        TE.map((metadataRepository) => ({
          dbConfig,
          dependencies: { checkpointRepository, metadataRepository },
        })),
      ),
    ),
    TE.chain(({ dbConfig, dependencies }) =>
      pipe(
        copyAllStep(dependencies, {
          destinationDir: input.destDir,
          idCheckpoint: input.idCheckpoint,
          batchSize: parseInt(input.batchSize, 10),
        })(),
        TE.map(() => dbConfig),
      ),
    ),
    TE.chain((dbConfig) => closeDB(dbConfig)),
  );
};
