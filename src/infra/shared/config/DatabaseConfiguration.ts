import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import Loki from 'lokijs';
import { autosaveInterval } from '../../../domain/shared/config/Constant.js';

const FILEMETADATA_DB = 'filemetadata.db';
const METADATA_COMPILE_DB = 'metadata_compile.db';
const CHECKPOINT_DB = 'checkpoint.db';

export class DatabaseConfiguration {
  private static instance: DatabaseConfiguration | null = null;

  public readonly fileMetadataDB: Loki;
  public readonly compiledMetadataDB: Loki;
  public readonly checkpointDB: Loki;

  private constructor(path: string) {
    this.fileMetadataDB = this.initDatabase(path, FILEMETADATA_DB);
    this.compiledMetadataDB = this.initDatabase(path, METADATA_COMPILE_DB);
    this.checkpointDB = this.initDatabase(path, CHECKPOINT_DB);
  }

  private initDatabase(path: string, filename: string): Loki {
    return new Loki(`${path}${filename}`, {
      autosave: true,
      autosaveInterval: autosaveInterval,
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
        () => new Error("DATABASE : CAN'T LOAD DATABASE"),
      ),
    );
  }
}

export default DatabaseConfiguration;
