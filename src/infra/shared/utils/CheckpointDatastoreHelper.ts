import { BaseRepository } from './BaseRepository';
import CheckpointEntity from '../checkpoint/CheckpointEntity';

class CompiledMetadataDatastoreHelper extends BaseRepository<CheckpointEntity> {
  createEntity(param: {
    _id: string;
    lastUpdateDate: Date;
    processedFiles: string[];
  }) {}
}

export default CompiledMetadataDatastoreHelper;
