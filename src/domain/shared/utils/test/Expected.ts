import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { expect } from 'vitest';
import { ExifDateTime } from 'exiftool-vendored';
import FileMetadata from '../../../restore/FileMetadata';

/**
 * Ensures that the given Option is a `Some` and applies the provided validation function to its value.
 * @param option - The Option to validate.
 * @param validate - A function to validate the `Some` value.
 */
export const expectSome = <A>(
  option: O.Option<A>,
  validate: (value: A) => void,
): void => {
  if (O.isSome(option)) {
    validate(option.value);
  } else {
    throw new Error(`Expected Some but got None`);
  }
};

/**
 * Ensures that the given Option is a `None`.
 * @param option - The Option to validate.
 */
export const expectNone = <A>(option: O.Option<A>): void => {
  if (O.isNone(option)) {
    return;
  }
  throw new Error(
    `Expected None but got Some with: ${JSON.stringify(option.value)}`,
  );
};

/**
 * Ensures that the given Either is a `Right` and applies the provided validation function to its value.
 * @param either - The Either to validate.
 * @param validate - A function to validate the `Right` value.
 */
export const expectRight = <L, A>(
  either: E.Either<L, A>,
  validate: (result: A) => void,
): void => {
  if (E.isRight(either)) {
    validate(either.right);
  } else {
    throw new Error(
      `Expected Right but got Left with: ${JSON.stringify(either.left)}`,
    );
  }
};

/**
 * Ensures that the given Either is a `Left` and applies the provided validation function to its error.
 * @param either - The Either to validate.
 * @param validate - A function to validate the `Left` error.
 */
export const expectLeft = <L, A>(
  either: E.Either<L, A>,
  validate: (error: L) => void,
): void => {
  if (E.isLeft(either)) {
    validate(either.left);
  } else {
    throw new Error(
      `Expected Left but got Right with: ${JSON.stringify(either.right)}`,
    );
  }
};
