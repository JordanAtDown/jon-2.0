import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import CompiledMetadata from '../../domain/restore/CompiledMetadata';
import {
  CompileMetadataEntity,
  mapCompiledMetadataToCompileMetadataEntity,
  mapCompileMetadataEntityToMetadata,
} from '../sharedkernel/CompileMetadataEntity';
import { CompiledMetadataRepository } from '../../domain/restore/CompiledMetadataRepository';
import { BaseRepository } from '../shared/utils/BaseRepository';

class NeDBCompiledMetadataRepository
  extends BaseRepository<CompileMetadataEntity>
  implements CompiledMetadataRepository
{
  save(metadata: CompiledMetadata): TE.TaskEither<Error, CompiledMetadata> {
    return pipe(
      TE.of(mapCompiledMetadataToCompileMetadataEntity(metadata)),
      TE.chain((entity) => this.saveOrUpdate(entity, { _id: entity._id })),
      TE.map(mapCompileMetadataEntityToMetadata),
    );
  }
}

export default NeDBCompiledMetadataRepository;
