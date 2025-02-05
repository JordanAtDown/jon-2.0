import { LokiJSBaseRepository } from './LokiJSBaseRepository.js';
import CheckpointEntity from '../../../infra/sharedkernel/checkpoint/CheckpointEntity.js';

class CheckpointDBHelper extends LokiJSBaseRepository<CheckpointEntity> {
  constructor(db: Loki) {
    super(db, 'checkpoint');
  }
}

export default CheckpointDBHelper;
