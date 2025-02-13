import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { PipelineStep } from '../../_step/PipelineStep.js';
import { combineValidations } from '../../utils/CombineValidations.js';
import {
  validateBatchSize,
  validateIdChekpoint,
} from '../../utils/Validations.js';
import { pipe } from 'fp-ts/lib/function.js';

export type CompileCommandInput = {
  idCheckpoint: string;
  batchSize: string;
};

export const validateCompileParamsInput: PipelineStep<
  CompileCommandInput,
  CompileCommandInput
> = (input) => TE.fromEither(validateInput(input));

const validateInput = combineValidations<CompileCommandInput>(
  (compileCommandInput) =>
    pipe(
      compileCommandInput.batchSize,
      validateBatchSize,
      E.map(() => compileCommandInput),
    ),
  (params) =>
    pipe(
      params.idCheckpoint,
      validateIdChekpoint,
      E.map(() => params),
    ),
);
