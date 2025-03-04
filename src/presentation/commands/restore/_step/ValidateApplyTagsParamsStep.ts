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

export type ApplyCommandInput = {
  rootDirectory: string;
  extensions: string;
  batchSize: string;
};

export const validateApplyTagsParamsInput: PipelineStep<
  ApplyCommandInput,
  ApplyCommandInput
> = (input) => TE.fromEither(validateInput(input));

const validateInput = combineValidations<ApplyCommandInput>(
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
);
