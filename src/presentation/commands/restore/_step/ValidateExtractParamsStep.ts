import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { PipelineStep } from '../../_step/PipelineStep.js';
import { combineValidations } from '../../utils/CombineValidations.js';
import {
  validateBatchSize,
  validateDirectoryExists,
  validateExtensions,
  validateIdChekpoint,
} from '../../utils/Validations.js';
import { pipe } from 'fp-ts/lib/function.js';

export type ExtractCommandInput = {
  rootDirectory: string;
  extensions: string;
  batchSize: string;
  idCheckpoint: string;
};

export const validateExtractParamsInput: PipelineStep<
  ExtractCommandInput,
  ExtractCommandInput
> = (input) => TE.fromEither(validateInput(input));

const validateInput = combineValidations<ExtractCommandInput>(
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
  (params) =>
    pipe(
      params.idCheckpoint,
      validateIdChekpoint,
      E.map(() => params),
    ),
);
