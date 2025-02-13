import { LokiJSBaseRepository } from './LokiJSBaseRepository.js';
import { FileMetadataEntity } from '../../../infra/restore/FileMetadataEntity.js';
import Loki from 'lokijs';
import { DatabaseConfig } from '../../../infra/shared/config/Database.js';
import { RepositoryFactory } from './RepositoryFactory.js';

class FileMetadataDBHelper extends LokiJSBaseRepository<FileMetadataEntity> {
  constructor(db: Loki, database: DatabaseConfig) {
    const collection = RepositoryFactory.createCollection<FileMetadataEntity>(
      db,
      database,
    );
    super(collection);
  }
}

export default FileMetadataDBHelper;
