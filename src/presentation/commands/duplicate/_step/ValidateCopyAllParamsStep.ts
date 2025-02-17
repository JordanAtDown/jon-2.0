import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { PipelineStep } from '../../_step/PipelineStep.js';
import { combineValidations } from '../../utils/CombineValidations.js';
import { validateIdChekpoint, validateIsCSV } from '../../utils/Validations.js';
import { pipe } from 'fp-ts/lib/function.js';

export type MergeCommandInput = {
  filepath: string;
  idCheckpoint: string;
};

export const validateMergeParamsInput: PipelineStep<
  MergeCommandInput,
  MergeCommandInput
> = (input) => TE.fromEither(validateInput(input));

const validateInput = combineValidations<MergeCommandInput>(
  (params) =>
    pipe(
      params.filepath,
      validateIsCSV,
      E.map(() => params),
    ),
  (params) =>
    pipe(
      params.idCheckpoint,
      validateIdChekpoint,
      E.map(() => params),
    ),
);
