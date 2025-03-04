import * as TE from 'fp-ts/lib/TaskEither.js';
import * as A from 'fp-ts/lib/Array.js';
import { pipe } from 'fp-ts/lib/function.js';

/**
 * Wraps a promise in a `TaskEither` to handle success and errors.
 * - On success, returns a `Right` with the result.
 * - On failure, returns a `Left` with an error.
 *
 * @template T The type of the result from the promise.
 * @param task A function that returns a `Promise`.
 * @returns A `TaskEither` that represents the success or failure of the task.
 *
 * @example
 * const fetchTask = tryCatchTask(() => fetch('https://example.com').then(res => res.json()));
 */
export const tryCatchTask = <T>(
  task: () => Promise<T>,
): TE.TaskEither<Error, T> =>
  TE.tryCatch(task, (reason) => new Error(String(reason)));

/**
 * Returns items from the first array that are not in the second array.
 *
 * @param allItems All available items.
 * @param processedItems Items that have been processed.
 * @returns A new array with items that are not processed.
 *
 * @example
 * const all = ['a', 'b', 'c'];
 * const processed = ['b'];
 * const result = filterItems(all, processed); // ['a', 'c']
 */
export const filterItems = (
  allItems: string[],
  processedItems: string[],
): string[] => allItems.filter((item) => !processedItems.includes(item));

/**
 * Transforms a Node.js-style callback function into a TaskEither from fp-ts.
 *
 * @param fn - A function that expects a callback in the form of (err, result).
 * @returns A TaskEither containing either an Error or the successful result.
 */
export const fromCallback = <T>(
  fn: (callback: (err: Error | null, result: T | null) => void) => void,
): TE.TaskEither<Error, T> =>
  TE.tryCatch(
    () =>
      new Promise<T>((resolve, reject) =>
        fn((err, result) => {
          if (err) return reject(err);
          if (result === null) return reject(new Error('No result found'));
          resolve(result);
        }),
      ),
    (reason) => new Error(String(reason)),
  );

/**
 * A utility function to simplify handling NeDB's callback-based methods by converting them
 * into a `TaskEither`, which is part of the `fp-ts` library. This function wraps an asynchronous
 * NeDB method (or any callback-based function) and transforms it into a `TaskEither<Error, T>`.
 *
 * @template T - The expected type of the result returned by the datastore method.
 *
 * @param datastoreMethod - A function representing the NeDB operation. It must accept a callback
 * that follows the Node.js convention: the first argument is an error (or null), and the second
 * is the result (or null).
 *
 * @returns {TE.TaskEither<Error, T>} - A `TaskEither` which:
 *   - If the operation succeeds, resolves to the `Right` state containing the result of type `T`.
 *   - If the operation fails (returns an error), resolves to the `Left` state containing an instance of `Error`.
 *
 * ### Example Usage:
 * Transform a NeDB `find` operation into a `TaskEither`:
 * ```typescript
 * import { taskFromNedb } from './utils/taskFromNedb';
 *
 * const findItems = taskFromNedb<MyDataType[]>((cb) =>
 *   myDatastore.find({ someField: 'value' }, cb)
 * );
 *
 * // Use the returned TaskEither
 * findItems().then((either) => {
 *   if (either._tag === 'Left') {
 *     console.error('Error:', either.left); // Handle error
 *   } else {
 *     console.log('Success:', either.right); // Handle success
 *   }
 * });
 * ```
 *
 * ### Benefits:
 * - Simplifies callback-to-`Promise` transformation.
 * - Seamlessly integrates with fp-ts utilities like `pipe`, `chain`, and `map`.
 * - Reduces verbosity and repetitive logic when working with NeDB's callback-based API.
 *
 * ### Error Handling:
 * This function ensures that:
 * - If the callback provides an error (`err` is not null), it is propagated as the "Left" state.
 * - If the callback provides a null `result`, it throws an "Unknown error or empty result".
 * - If an unexpected error occurs in the function (e.g., during `resolve`/`reject`), it is wrapped into an `Error` instance.
 */
export const taskFromNeDB = <T>(
  datastoreMethod: (cb: (err: Error | null, result: T | null) => void) => void,
): TE.TaskEither<Error, T> => {
  return TE.tryCatch(
    () =>
      new Promise<T>((resolve, reject) => {
        datastoreMethod((err, result) => {
          if (err) {
            reject(err);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Unknown error or empty result'));
          }
        });
      }),
    (reason) => (reason instanceof Error ? reason : new Error(String(reason))),
  );
};

/**
 * Filters out keys with `null` or `undefined` values from an object.
 *
 * This utility function is generic and preserves the input type. It dynamically
 * removes any key-value pair where the value is either `null` or `undefined`,
 * returning a new object with only defined values.
 *
 * @template T - Type of the input object, extending `Record<string, unknown>`.
 *
 * @param {T} input - The input object to be filtered.
 * @returns {Partial<T>} - A new object containing only the keys with defined values.
 *
 * @example
 * // Example 1: Simple object filtering
 * const data = {
 *   name: 'Alice',
 *   age: null,
 *   email: 'alice@example.com',
 *   isActive: undefined,
 * };
 * const filteredData = filterDefinedKeys(data);
 * console.log(filteredData);
 * // Output: { name: 'Alice', email: 'alice@example.com' }
 *
 * @example
 * // Example 2: Filtering a typed object (e.g., ExifMetadata)
 * import { DateTime } from 'luxon';
 *
 * type ExifMetadata = {
 *   dateTimeOriginal?: DateTime;
 *   GPSLatitude?: number;
 *   GPSLongitude?: number;
 *   CameraModel?: string;
 * };
 *
 * const exifData: ExifMetadata = {
 *   dateTimeOriginal: DateTime.fromISO('2023-11-08T10:34:00'),
 *   CameraModel: 'Canon EOS 5D',
 *   GPSLatitude: null, // Ignored
 *   GPSLongitude: undefined, // Ignored
 * };
 *
 * const filteredExif = filterDefinedKeys(exifData);
 * console.log(filteredExif);
 * // Output: { dateTimeOriginal: ..., CameraModel: 'Canon EOS 5D' }
 *
 * @example
 * // Example 3: Generic usage with dynamic objects
 * const rawObject = {
 *   key1: 42,
 *   key2: null,
 *   key3: 'hello',
 *   key4: undefined,
 * };
 *
 * const result = filterDefinedKeys(rawObject);
 * console.log(result);
 * // Output: { key1: 42, key3: 'hello' }
 */
export const filterDefinedKeys = <T extends Record<string, unknown>>(
  input: T,
): Partial<T> => {
  return Object.entries(input).reduce((acc, [key, value]) => {
    if (value != null) {
      acc[key as keyof T] = value as T[keyof T];
    }
    return acc;
  }, {} as Partial<T>);
};

/**
 * Applique une fonction asynchrone avec limitation de concurrence
 * sur chaque élément d'un tableau.
 *
 * @param array - Les éléments à traiter
 * @param maxConcurrency - Nombre maximal de tâches en parallèle
 * @param fn - La fonction qui transforme chaque élément en TaskEither
 * @returns TaskEither<Error, void> : Une tâche contenant aucune erreur si tout réussit
 */
export function traverseArrayWithConcurrency<A>(
  array: A[],
  maxConcurrency: number,
  fn: (item: A) => TE.TaskEither<Error, void>,
): TE.TaskEither<Error, void> {
  const batches = A.chunksOf(maxConcurrency)(array);

  return pipe(
    batches,
    A.map((batch) => pipe(batch, A.map(fn), A.sequence(TE.ApplicativeSeq))),
    A.sequence(TE.ApplicativeSeq),
    TE.map(() => undefined),
  );
}
