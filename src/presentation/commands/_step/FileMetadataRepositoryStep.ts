import { DatabaseConfiguration } from '../../../infra/shared/config/DatabaseConfiguration.js';
import { DATABASES } from '../../../infra/shared/config/Database.js';
import LokiJSFileMetadataRepository from '../../../infra/restore/LokiJSFileMetadataRepository.js';
import { createGenericStep } from './GenericStep.js';

export const fileMetadataRepositoryStep = createGenericStep<
  DatabaseConfiguration,
  LokiJSFileMetadataRepository
>(async (dbConfig) => {
  return new LokiJSFileMetadataRepository(
    dbConfig.getDatabase(DATABASES.FILE_METADATA.id),
    DATABASES.FILE_METADATA,
  );
}, "Erreur lors de l'initialisation du dépôt LokiJSFileMetadataRepository");
