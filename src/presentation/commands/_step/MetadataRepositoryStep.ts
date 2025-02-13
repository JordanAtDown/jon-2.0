import { DatabaseConfiguration } from '../../../infra/shared/config/DatabaseConfiguration.js';
import { DATABASES } from '../../../infra/shared/config/Database.js';
import { createGenericStep } from './GenericStep.js';
import LokiJSMetadataRepository from '../../../infra/catalog/LokiJSMetadataRepository.js';

export const metadataRepositoryStep = createGenericStep<
  DatabaseConfiguration,
  LokiJSMetadataRepository
>(async (dbConfig) => {
  return new LokiJSMetadataRepository(
    dbConfig.getDatabase(DATABASES.METADATA_COMPILE.id),
    DATABASES.METADATA_COMPILE,
  );
}, "Erreur lors de l'initialisation du dépôt LokiJSMetadataRepository");
