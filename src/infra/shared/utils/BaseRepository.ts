import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import Datastore from '@seald-io/nedb';
import { taskFromNeDB } from '../../../domain/shared/utils/fp/FP';

export class BaseRepository<T extends Record<string, any>> {
  private readonly datastore: Datastore;

  constructor(datastore: Datastore) {
    this.datastore = datastore;
  }

  /**
   * Finds an item in the datastore that matches the specified filter.
   *
   * @param filter - A `Partial<T>` object specifying the search criteria.
   *                 Must not be null or undefined. Used to match one or more fields of `T`.
   *
   * @returns A `TaskEither<Error, Option<T>>`:
   *   - `Some<T>` if an item is found.
   *   - `None` if no item matches the filter.
   *   - `Left<Error>` if an error occurs (e.g., invalid arguments or database issues).
   */
  find(filter: Partial<T>): TE.TaskEither<Error, T[]> {
    return pipe(
      taskFromNeDB<T[]>((cb: (err: Error | null, docs: T[]) => void) =>
        this.datastore.find(
          filter,
          (err: Error | null, docs: T[] | undefined) =>
            cb(err, (docs ?? []) as T[]),
        ),
      ),
      TE.map((result) => result),
    );
  }

  /**
   * Saves an item to the datastore or updates it if it already exists.
   *
   * @param item - The item to save or update. Must not be null or undefined.
   * @param filter - An object of type `Partial<T>` specifying the criteria to check whether the item exists. Must not be null or undefined.
   *
   * @returns A `TaskEither<Error, T>` containing the saved/updated item or an error.
   */
  saveOrUpdate(item: T, filter: Partial<T>): TE.TaskEither<Error, T> {
    if (!item || !filter) {
      return TE.left(
        new Error(
          'Invalid arguments: item and filter must not be null or undefined',
        ),
      );
    }

    return taskFromNeDB<T>((cb) =>
      this.datastore.update(filter, { $set: item }, { upsert: true }, (err) =>
        cb(err, item),
      ),
    );
  }

  /**
   * Inserts a list of items into the datastore.
   *
   * @param items - The list of items to insert.
   *
   * @returns A `TaskEither<Error, T[]>` containing the inserted items or an error.
   */
  insertMany(items: T[]): TE.TaskEither<Error, T[]> {
    return taskFromNeDB<T[]>((cb) =>
      this.datastore.insert(items, (err, docs) => cb(err, docs as T[])),
    );
  }

  /**
   * Deletes items in the datastore that match the specified filter.
   *
   * @param filter - An object of type `Partial<T>` specifying the criteria for deletion.
   *                 You can provide one or more fields of `T` to filter by.
   *
   * @returns A `TaskEither<Error, number>` containing the number of deleted documents or an error.
   */
  delete(filter: Partial<T>): TE.TaskEither<Error, number> {
    return taskFromNeDB<number>(
      (cb: (err: Error | null, count: number) => void) =>
        this.datastore.remove(filter, { multi: true }, cb),
    );
  }
}
