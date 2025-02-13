import { DatabaseConfiguration } from '../../../infra/shared/config/DatabaseConfiguration.js';
import LokiJSCompiledMetadataRepository from '../../../infra/restore/LokiJSCompiledMetadataRepository.js';
import { DATABASES } from '../../../infra/shared/config/Database.js';
import { createGenericStep } from './GenericStep.js';

export const metadataCompileRepositoryStep = createGenericStep<
  DatabaseConfiguration,
  LokiJSCompiledMetadataRepository
>(async (dbConfig) => {
  return new LokiJSCompiledMetadataRepository(
    dbConfig.getDatabase(DATABASES.METADATA_COMPILE.id),
    DATABASES.METADATA_COMPILE,
  );
}, "Erreur lors de l'initialisation du dépôt MetadataCompile");
