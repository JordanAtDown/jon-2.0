import Loki from 'lokijs';
import { taskEither as TE, array as A } from 'fp-ts';
import { DATABASES, Database } from './Database.js';
import { DatabaseInitializer } from './DatabaseInitializer.js';
import { pipe } from 'fp-ts/lib/function.js';

export class DatabaseConfiguration {
  private static instance: DatabaseConfiguration | null = null;

  private readonly databases: Record<Database, Loki> = {} as Record<
    Database,
    Loki
  >;

  private readonly readyPromises: Record<Database, Promise<void>> =
    {} as Record<Database, Promise<void>>;

  private constructor(path: string) {
    (Object.keys(DATABASES) as Database[]).forEach((dbName) => {
      const dbConfig = DATABASES[dbName];

      const [readyPromise, resolveReady] = this.createReadyPromise();

      this.readyPromises[dbName] = readyPromise;
      this.databases[dbName] = DatabaseInitializer.initDatabase(
        path,
        dbConfig,
        resolveReady,
      );
    });
  }

  private createReadyPromise(): [Promise<void>, () => void] {
    let resolveReady!: () => void;
    const promise = new Promise<void>((resolve) => {
      resolveReady = resolve;
    });
    return [promise, resolveReady];
  }

  /**
   * Returns a singleton instance of the DatabaseConfiguration class.
   * Ensures a single instance exists for the entire application.
   *
   * @param path - The file system path where databases are stored.
   * @returns The DatabaseConfiguration instance.
   */
  public static getInstance(path: string): DatabaseConfiguration {
    if (!this.instance) {
      this.instance = new DatabaseConfiguration(path);
    }
    return this.instance;
  }

  /**
   * Retrieves the ready promise associated with a specific database.
   * This promise resolves when the database is fully loaded and ready to be used.
   *
   * @param dbName - The name of the database to retrieve the promise for.
   * @returns A promise that resolves when the database is ready.
   *
   * @example
   * // Assume 'myDatabase' is a database defined in the DATABASES configuration
   * const dbConfig = DatabaseConfiguration.getInstance('/path/to/databases');
   *
   * async function useDatabase() {
   *   // Wait for the database to be ready
   *   await dbConfig.getDatabaseReadyPromise('myDatabase');
   *   console.log('The database is ready!');
   *
   *   // Retrieve the database instance after it's ready
   *   const db = dbConfig.getDatabase('myDatabase');
   *   // Perform operations on the database instance
   * }
   *
   * // Call the function
   * useDatabase();
   */
  public isDatabaseReady(dbName: Database): Promise<void> {
    return this.readyPromises[dbName];
  }
  public areDatabasesReady(dbNames: Database[]): Promise<void[]> {
    return Promise.all(dbNames.map((dbName) => this.isDatabaseReady(dbName)));
  }

  public closeAllDb(): Promise<void> {
    return pipe(
      Object.values(this.databases),
      A.map((db) =>
        TE.tryCatch(
          () =>
            new Promise<void>((resolve, reject) =>
              db.close((err) => (err ? reject(err) : resolve())),
            ),
          (err) => new Error(`Failed to close database: ${String(err)}`),
        ),
      ),
      A.sequence(TE.ApplicativePar),
      TE.match(
        (error) => new Error(`Error closing databases : ${error}`),
        () => {},
      ),
    )();
  }

  /**
   * Clears all collections in all databases.
   * Empties all collections and saves each database to persist the cleaned state.
   *
   * @returns A promise indicating the completion of the cleanup process.
   */
  public async clearAllCollections(): Promise<void> {
    const clearPromises = Object.entries(this.databases).map(([dbName, db]) => {
      return new Promise<void>((resolve, reject) => {
        try {
          db.collections.forEach((collection) => collection.clear());
          db.saveDatabase((err) => {
            if (err) {
              reject(
                new Error(
                  `Failed to save cleared database '${dbName}': ${err.message}`,
                ),
              );
            } else {
              resolve();
            }
          });
        } catch (err) {
          reject(
            new Error(`Failed to clear database '${dbName}': ${String(err)}`),
          );
        }
      });
    });

    await Promise.all(clearPromises);
  }

  /**
   * Retrieves the database instance by its name.
   *
   * @param dbName - The name of the database.
   * @returns The db (Loki) instance associated with the key, or throws an error if the database does not exist.
   */
  public getDatabase(dbName: Database): Loki {
    const database = this.databases[dbName];
    if (!database) {
      throw new Error(`Database '${dbName}' does not exist.`);
    }
    return database;
  }
}
