import Loki from 'lokijs';
import Logger from '../../../presentation/commands/utils/Logger.js';
import { DatabaseConfig } from './Database.js';

export class DatabaseInitializer {
  /**
   * Initializes a LokiJS database with the specified configuration.
   * Sets up automatic loading, saving, and event listeners for the database lifecycle.
   *
   * @param path - The base file system path where the database file will be stored.
   * @param config - Configuration object for the database, including filename and name.
   * @param resolveReady - A callback function that will be called when the database is fully loaded.
   * @returns An instance of the LokiJS database.
   */
  public static initDatabase(
    path: string,
    config: DatabaseConfig,
    resolveReady: () => void,
  ): Loki {
    const { filename, name } = config;
    const isTestEnvironment = process.env['NODE_ENV'] === 'test';

    Logger.debug(`Initializing database on file '${filename}'`);
    const db = new Loki(`${path}/${filename}`, {
      serializationMethod: 'normal',
      autoload: true,
      autosave: true,
      autosaveInterval: isTestEnvironment ? 0 : 1000,
      autoloadCallback: () => {
        this.onAutoloadCallback(db, filename, resolveReady);
      },
      persistenceMethod: isTestEnvironment ? 'memory' : 'fs',
    });

    db.name = name;
    this.setupEventListeners(db, filename);
    return db;
  }

  private static onAutoloadCallback(
    db: Loki,
    filename: string,
    resolveReady: () => void,
  ): void {
    Logger.debug(`Database on file '${filename}' successfully loaded.`);
    this.checkCollectionsExist(db);
    resolveReady();
  }

  private static checkCollectionsExist(db: Loki): void {
    const collections = db.listCollections();

    if (collections.length > 0) {
      Logger.debug(
        `Database '${db.name}' loaded collections: ${collections
          .map((c) => `'${c.name}' (${c.count || 0} items)`)
          .join(', ')}`,
      );
    } else {
      Logger.warn(
        `Database '${db.name}' has no collections. Collections may need to be recreated.`,
      );
    }
  }

  private static setupEventListeners(db: Loki, filename: string): void {
    db.on('close', () => Logger.debug(`Database '${filename}' closed.`));
    db.on('autosave', () => Logger.debug(`Database '${filename}' autosaved.`));
    db.on('error', (err) =>
      Logger.error(`Error in database '${filename}': ${err.message}`),
    );
  }
}
