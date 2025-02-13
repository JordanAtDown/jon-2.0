import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { PipelineStep } from '../../_step/PipelineStep.js';
import { combineValidations } from '../../utils/CombineValidations.js';
import {
  validateBatchSize,
  validateDirectoryExists,
  validateIdChekpoint,
} from '../../utils/Validations.js';
import { pipe } from 'fp-ts/lib/function.js';

export type CopyCommandInput = {
  destDir: string;
  idCheckpoint: string;
  batchSize: string;
};

export const validateCopyAllParamsInput: PipelineStep<
  CopyCommandInput,
  CopyCommandInput
> = (input) => TE.fromEither(validateInput(input));

const validateInput = combineValidations<CopyCommandInput>(
  (compileCommandInput) =>
    pipe(
      compileCommandInput.batchSize,
      validateBatchSize,
      E.map(() => compileCommandInput),
    ),
  (params) =>
    pipe(
      params.destDir,
      validateDirectoryExists,
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
