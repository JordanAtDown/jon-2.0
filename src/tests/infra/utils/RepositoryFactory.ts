import Logger from '../../../presentation/commands/utils/Logger.js';
import { Collection } from 'lokijs';
import { DatabaseConfig } from '../../../infra/shared/config/Database.js';

export class RepositoryFactory {
  static createCollection<ENTITY extends Object>(
    db: Loki,
    database: DatabaseConfig,
  ): Collection<ENTITY> {
    const collection = this.getOrCreateCollection<ENTITY>(db, database);
    this.configureCollection(collection, database);
    return collection;
  }

  private static getOrCreateCollection<ENTITY extends Object>(
    db: Loki,
    database: DatabaseConfig,
  ): Collection<ENTITY> {
    let collection = db.getCollection<ENTITY>(database.collection);

    if (!collection) {
      Logger.info(
        `Collection '${database.collection}' does not exist. Creating...`,
      );
      collection = db.addCollection<ENTITY>(database.collection, {
        unique: [...database.unique] as (keyof ENTITY)[],
        indices: [...database.indices] as (keyof ENTITY)[],
      });
    } else {
      Logger.info(`Using existing collection: '${database.collection}'`);
    }

    return collection;
  }

  private static configureCollection<ENTITY extends Object>(
    collection: Collection<ENTITY>,
    database: DatabaseConfig,
  ): void {
    database.indices.forEach((index) => {
      if (!collection.binaryIndices[index as keyof ENTITY]) {
        Logger.info(`Creating index on field: '${index}'`);
        collection.ensureIndex(index as keyof ENTITY);
      }
    });

    Logger.info(
      `Collection '${collection.name}' configured with unique fields: '${
        database.unique.length > 0 ? database.unique.join(', ') : 'none'
      }' and indices: '${
        database.indices.length > 0 ? database.indices.join(', ') : 'none'
      }'.`,
    );
  }
}
