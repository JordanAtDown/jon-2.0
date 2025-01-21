import DatabaseConfiguration from '../config/DatabaseConfiguration'; // Adaptez ce chemin si nécessaire
import * as E from 'fp-ts/Either';

/**
 * Initializes a database configuration with `DatabaseConfiguration`.
 * @param path - The directory containing the database files.
 * @returns A promise with an instance of `DatabaseConfiguration`, or throws an error if initialization fails.
 */
export const initializeDatabase = async (
  path: string,
): Promise<DatabaseConfiguration> => {
  const dbConfigOrError = DatabaseConfiguration.getInstance(path);

  if (E.isLeft(dbConfigOrError)) {
    throw dbConfigOrError.left; // Lance une erreur s'il y a un problème avec l'initialisation
  }

  return dbConfigOrError.right;
};

export default initializeDatabase;
