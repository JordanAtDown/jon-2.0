import { LokiJSBaseRepository } from './LokiJSBaseRepository.js';
import { CompileMetadataEntity } from '../../../infra/sharedkernel/CompileMetadataEntity.js';
import Loki from 'lokijs';
import { DatabaseConfig } from '../../../infra/shared/config/Database.js';
import { RepositoryFactory } from './RepositoryFactory.js';

class CompiledMetadataDBHelper extends LokiJSBaseRepository<CompileMetadataEntity> {
  constructor(db: Loki, database: DatabaseConfig) {
    const collection =
      RepositoryFactory.createCollection<CompileMetadataEntity>(db, database);
    super(collection);
  }
}

export default CompiledMetadataDBHelper;
