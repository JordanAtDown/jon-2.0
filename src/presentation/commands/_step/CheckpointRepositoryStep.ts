import { DatabaseConfiguration } from '../../../infra/shared/config/DatabaseConfiguration.js';
import { DATABASES } from '../../../infra/shared/config/Database.js';
import LokiJSCheckpoint from '../../../infra/sharedkernel/checkpoint/LokiJSCheckpoint.js';
import { createGenericStep } from './GenericStep.js';

export const checkpointRepositoryStep = createGenericStep<
  DatabaseConfiguration,
  LokiJSCheckpoint
>(async (dbConfig) => {
  return new LokiJSCheckpoint(
    dbConfig.getDatabase(DATABASES.CHECKPOINT.id),
    DATABASES.CHECKPOINT,
  );
}, "Erreur lors de l'initialisation du dépôt Checkpoint");
