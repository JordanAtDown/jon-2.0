import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { LokiJSBaseRepository } from '../../tests/infra/utils/LokiJSBaseRepository.js';
import {
  CompileMetadataEntity,
  mapCompiledMetadataToCompileMetadataEntity,
  mapCompileMetadataEntityToMetadata,
} from '../sharedkernel/CompileMetadataEntity.js';
import { CompiledMetadataRepository } from '../../domain/restore/CompiledMetadataRepository.js';
import CompiledMetadata from '../../domain/sharedkernel/metadata/CompiledMetadata.js';

const compiledMetadata = 'compiled_metadata';

class LokiJSompiledMetadataRepository
  extends LokiJSBaseRepository<CompileMetadataEntity>
  implements CompiledMetadataRepository
{
  constructor(db: Loki) {
    super(db, compiledMetadata);
  }

  save(metadata: CompiledMetadata): TE.TaskEither<Error, CompiledMetadata> {
    return pipe(
      TE.of(mapCompiledMetadataToCompileMetadataEntity(metadata)),
      TE.chain((entity) => this.saveOrUpdate({ _id: entity._id }, entity)),
      TE.map(mapCompileMetadataEntityToMetadata),
    );
  }
}

export default LokiJSompiledMetadataRepository;
