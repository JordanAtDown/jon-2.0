import { LokiJSBaseRepository } from './LokiJSBaseRepository.js';
import CheckpointEntity from '../../../infra/sharedkernel/checkpoint/CheckpointEntity.js';
import Loki from 'lokijs';
import { DatabaseConfig } from '../../../infra/shared/config/Database.js';
import { RepositoryFactory } from './RepositoryFactory.js';

class CheckpointDBHelper extends LokiJSBaseRepository<CheckpointEntity> {
  constructor(db: Loki, database: DatabaseConfig) {
    const collection = RepositoryFactory.createCollection<CheckpointEntity>(
      db,
      database,
    );
    super(collection);
  }
}

export default CheckpointDBHelper;
