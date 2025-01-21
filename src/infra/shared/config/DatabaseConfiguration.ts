import Datastore from '@seald-io/nedb';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

const METADATA_DB = 'metadata.db';
const METADATA_COMPILE_DB = 'metadata_compile.db';
const CHECKPOINT_DB = 'checkpoint.db';

export class DatabaseConfiguration {
  private static instance: DatabaseConfiguration | null = null;

  public readonly fileMetadataDB: Datastore;
  public readonly compiledMetadataDB: Datastore;
  public readonly checkpointDB: Datastore;

  private constructor(path: string) {
    this.fileMetadataDB = this.initDatabase(path, METADATA_DB);
    this.compiledMetadataDB = this.initDatabase(path, METADATA_COMPILE_DB);
    this.checkpointDB = this.initDatabase(path, CHECKPOINT_DB);
  }

  private initDatabase(path: string, filename: string): Datastore {
    return new Datastore({
      filename: `${path}${filename}`,
      autoload: true,
    });
  }

  /**
   * Returns a unique instance of DatabaseConfiguration encapsulated in an Either.
   * @param path - Configuration directory where the configuration files are stored.
   * @returns A `Right<DatabaseConfiguration>` instance or a `Left<Error>`.
   */
  public static getInstance(
    path: string,
  ): E.Either<Error, DatabaseConfiguration> {
    return pipe(
      E.tryCatch(
        () => {
          if (!DatabaseConfiguration.instance) {
            DatabaseConfiguration.instance = new DatabaseConfiguration(path);
          }
          return DatabaseConfiguration.instance;
        },
        (error) =>
          new Error(
            `Erreur lors de la création de la configuration des bases de données: ${
              (error as Error).message
            }`,
          ),
      ),
    );
  }
}

export default DatabaseConfiguration;
