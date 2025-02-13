import { PipelineStep } from './PipelineStep.js';
import { DatabaseConfiguration } from '../../../infra/shared/config/DatabaseConfiguration.js';
import { DATABASES } from '../../../infra/shared/config/Database.js';
import * as TE from 'fp-ts/lib/TaskEither.js';

export const dbReadyStep: PipelineStep<
  DatabaseConfiguration,
  DatabaseConfiguration
> = (dbConfig) =>
  TE.chain(() =>
    TE.tryCatch(
      async () => {
        await dbConfig.areDatabasesReady([
          DATABASES.CHECKPOINT.id,
          DATABASES.FILE_METADATA.id,
          DATABASES.METADATA_COMPILE.id,
        ]);
        return dbConfig;
      },
      () => new Error('Les bases de données ne sont pas prêtes.'),
    ),
  )(TE.right(dbConfig));
