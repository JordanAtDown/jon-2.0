import { Command } from 'commander';
import {
  MoveCommandInput,
  validateMoveParamsInput,
} from './_step/ValidateMoveParamsStep.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { moveStep } from './_step/MoveStep.js';
import { setLogConsoleMode } from '../utils/Logger.js';

export const move = new Command('move')
  .description('Move and catalog files')
  .argument('<rootDirectory>', 'source directory')
  .argument('<destinationDirectory>', 'destination directory')
  .argument('<extensions>', 'list of extensions, separated by comma')
  .argument('<batch>', 'size of the batch')
  .action(
    (rootDir: string, destDir: string, extensions: string, batch: string) => {
      setLogConsoleMode(false);
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
