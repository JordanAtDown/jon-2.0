import { Command } from 'commander';
import { cpus } from 'os';
import {
  MoveCommandInput,
  validateMoveParamsInput,
} from './_step/ValidateMoveParamsStep.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { moveStep } from './_step/MoveStep.js';
import { setLogConsoleMode } from '../utils/Logger.js';
import { setMaxProcs } from '../../../domain/shared/exif/ExifWriting.js';

// Récupérer le nombre total de cœurs CPU disponibles
const numCores = cpus().length;

const defaultProcs = Math.max(1, Math.floor(numCores * 0.8));

export const move = new Command('move')
  .description('Move and catalog files')
  .argument('<rootDirectory>', 'source directory')
  .argument('<destinationDirectory>', 'destination directory')
  .argument('<extensions>', 'list of extensions, separated by comma')
  .argument('<batch>', 'size of the batch')
  .option(
    '-p, --procs <number>',
    `number of processes to use (default: ${defaultProcs})`,
  )
  .action(
    (
      rootDir: string,
      destDir: string,
      extensions: string,
      batch: string,
      options: { procs?: string },
    ) => {
      setLogConsoleMode(false);
      const procs = options.procs ? parseInt(options.procs, 10) : defaultProcs;
      setMaxProcs(procs);

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
            console.error(error.message);
          },
          () => {
            console.info('Success');
          },
        ),
      )();
    },
  );

const Pipeline = (input: MoveCommandInput): TE.TaskEither<Error, void> => {
  return pipe(
    validateMoveParamsInput(input),
    TE.chain((input) =>
      moveStep({
        rootDirectory: input.rootDirectory,
        destinationDirectory: input.destDir,
        extensions: input.extensions.split(','),
        batchSize: parseInt(input.batchSize, 10),
      })(),
    ),
  );
};
