import { DatabaseConfiguration } from '../../../infra/shared/config/DatabaseConfiguration.js';

/**
 * Initializes a database configuration with `DatabaseConfiguration`.
 * @param path - The directory containing the database files.
 * @returns A promise with an instance of `DatabaseConfiguration`, or throws an error if initialization fails.
 */
export const initializeDB = async (
  path: string,
): Promise<DatabaseConfiguration> => {
  return DatabaseConfiguration.getInstance(path);
};

export default initializeDB;
