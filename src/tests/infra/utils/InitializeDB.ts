import * as E from 'fp-ts/Either';
import DatabaseConfiguration from '../../../infra/shared/config/DatabaseConfiguration.js';

/**
 * Initializes a database configuration with `DatabaseConfiguration`.
 * @param path - The directory containing the database files.
 * @returns A promise with an instance of `DatabaseConfiguration`, or throws an error if initialization fails.
 */
export const initializeDB = async (
  path: string,
): Promise<DatabaseConfiguration> => {
  const dbConfigOrError = DatabaseConfiguration.getInstance(path);

  if (E.isLeft(dbConfigOrError)) {
    throw dbConfigOrError.left;
  }

  return dbConfigOrError.right;
};

export default initializeDB;
