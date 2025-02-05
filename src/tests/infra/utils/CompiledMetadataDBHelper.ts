import { LokiJSBaseRepository } from './LokiJSBaseRepository.js';
import { CompileMetadataEntity } from '../../../infra/sharedkernel/CompileMetadataEntity.js';

class CompiledMetadataDBHelper extends LokiJSBaseRepository<CompileMetadataEntity> {
  constructor(db: Loki) {
    super(db, 'compiled_metadata');
  }
}

export default CompiledMetadataDBHelper;
