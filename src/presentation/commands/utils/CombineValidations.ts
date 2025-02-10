import * as E from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import { Validation } from './Validations.js';

export const combineValidations =
  <TYPE>(...validations: Validation<TYPE>[]): Validation<TYPE> =>
  (input: TYPE) =>
    validations.reduce<E.Either<Error, TYPE>>(
      (acc, validation) => pipe(acc, E.chain(validation)),
      E.right(input),
    );

export const validateCondition =
  <TYPE>(
    message: string,
    condition: (input: TYPE) => boolean,
  ): Validation<TYPE> =>
  (input: TYPE) =>
    condition(input) ? E.right(input) : E.left(new Error(message));
