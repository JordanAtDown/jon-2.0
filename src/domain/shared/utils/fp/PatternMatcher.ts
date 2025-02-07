import { pipe } from 'fp-ts/lib/function.js';
import * as O from 'fp-ts/lib/Option.js';

export type Matcher<T, R> = [
  matchWhen: (value: T) => boolean,
  result: (value: T) => R,
];

/**
 * Creates a matching function that evaluates a series of conditions (matchers).
 * It returns an optional result for the first matcher that satisfies the condition.
 *
 * @template T - The input type of the value to match.
 * @template R - The output type of the result if a match is found.
 *
 * @param {...Matcher<T, R>[]} matchers - A list of matchers, each consisting of:
 * - A `matchWhen` function to check if the value satisfies a condition.
 * - A `result` function to compute the result if the condition is met.
 *
 * @returns {(value: T) => O.Option<R>} A function that takes `value` as input and returns:
 * - `O.some(result)` if a matcher is satisfied.
 * - `O.none` if no matcher conditions are met or the input value is null/undefined.
 *
 * @example
 * // Define matchers
 * const matchers = [
 *   [(value: number) => value > 10, (value: number) => `${value} is greater than 10`],
 *   [(value: number) => value < 5, (value: number) => `${value} is less than 5`],
 * ];
 *
 * // Create the matching function
 * const matchValue = match(...matchers);
 *
 * // Example usages
 * console.log(matchValue(12)); // Output: O.some('12 is greater than 10')
 * console.log(matchValue(3));  // Output: O.some('3 is less than 5')
 * console.log(matchValue(7));  // Output: O.none
 */
export const match =
  <T, R>(...matchers: Matcher<T, R>[]): ((value: T) => O.Option<R>) =>
  (value: T): O.Option<R> =>
    value == null
      ? O.none
      : pipe(
          matchers.find(([when]) => when(value)),
          O.fromNullable,
          O.map(([_, result]) => result(value)),
        );
