import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { PipelineStep } from '../../_step/PipelineStep.js';
import { combineValidations } from '../../utils/CombineValidations.js';
import {
  validateBatchSize,
  validateDirectoryExists,
  validateExtensions,
} from '../../utils/Validations.js';
import { pipe } from 'fp-ts/lib/function.js';

export type MoveCommandInput = {
  rootDirectory: string;
  destDir: string;
  extensions: string;
  batchSize: string;
};

export const validateMoveParamsInput: PipelineStep<
  MoveCommandInput,
  MoveCommandInput
> = (input) => TE.fromEither(validateInput(input));

const validateInput = combineValidations<MoveCommandInput>(
  (compileCommandInput) =>
    pipe(
      compileCommandInput.batchSize,
      validateBatchSize,
      E.map(() => compileCommandInput),
    ),
  (params) =>
    pipe(
      params.rootDirectory,
      validateDirectoryExists,
      E.map(() => params),
    ),
  (params) =>
    pipe(
      params.destDir,
      validateDirectoryExists,
      E.map(() => params),
    ),
  (params) =>
    pipe(
      params.extensions,
      validateExtensions,
      E.map(() => params),
    ),
  (params) =>
    pipe(
      params.batchSize,
      validateBatchSize,
      E.map(() => params),
    ),
);
