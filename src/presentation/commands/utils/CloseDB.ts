import * as TE from 'fp-ts/lib/TaskEither.js';
import { DatabaseConfiguration } from '../../../infra/shared/config/DatabaseConfiguration.js';
import Logger from './Logger.js';

export const closeDB = (dbConfig: DatabaseConfiguration) =>
  TE.tryCatch(
    async () => {
      await dbConfig.closeAllDb();
      Logger.info('Toutes les bases de données fermées avec succès.');
    },
    (reason) =>
      new Error(`Error occurred while closing databases: ${String(reason)}`),
  );
