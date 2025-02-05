import { LokiJSBaseRepository } from './LokiJSBaseRepository.js';
import { FileMetadataEntity } from '../../../infra/restore/FileMetadataEntity.js';

class FileMetadataDBHelper extends LokiJSBaseRepository<FileMetadataEntity> {
  constructor(db: Loki) {
    super(db, 'file_metadata');
  }
}

export default FileMetadataDBHelper;
