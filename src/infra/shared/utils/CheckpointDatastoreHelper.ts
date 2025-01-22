import { BaseRepository } from './BaseRepository';
import CheckpointEntity from '../../sharedkernel/checkpoint/CheckpointEntity';

class CompiledMetadataDatastoreHelper extends BaseRepository<CheckpointEntity> {
  createEntity(param: {
    _id: string;
    lastUpdateDate: Date;
    processedFiles: string[];
  }) {}
}

export default CompiledMetadataDatastoreHelper;
