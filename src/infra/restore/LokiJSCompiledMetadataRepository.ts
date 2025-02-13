import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { LokiJSBaseRepository } from '../../tests/infra/utils/LokiJSBaseRepository.js';
import {
  CompileMetadataEntity,
  mapCompiledMetadataToCompileMetadataEntity,
  mapCompileMetadataEntityToMetadata,
} from '../sharedkernel/CompileMetadataEntity.js';
import { CompiledMetadataRepository } from '../../domain/restore/CompiledMetadataRepository.js';
import CompiledMetadata from '../../domain/sharedkernel/metadata/CompiledMetadata.js';
import Loki from 'lokijs';
import { DatabaseConfig } from '../shared/config/Database.js';
import { RepositoryFactory } from '../../tests/infra/utils/RepositoryFactory.js';

class LokiJSCompiledMetadataRepository
  extends LokiJSBaseRepository<CompileMetadataEntity>
  implements CompiledMetadataRepository
{
  constructor(db: Loki, database: DatabaseConfig) {
    const collection =
      RepositoryFactory.createCollection<CompileMetadataEntity>(db, database);
    super(collection);
  }

  save(metadata: CompiledMetadata): TE.TaskEither<Error, CompiledMetadata> {
    return pipe(
      TE.of(mapCompiledMetadataToCompileMetadataEntity(metadata)),
      TE.chain((entity) => this.saveOrUpdate({ _id: entity._id }, entity)),
      TE.map(mapCompileMetadataEntityToMetadata),
    );
  }
}

export default LokiJSCompiledMetadataRepository;
