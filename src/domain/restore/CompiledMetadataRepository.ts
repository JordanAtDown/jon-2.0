import * as TE from 'fp-ts/lib/TaskEither.js';
import CompiledMetadata from '../sharedkernel/metadata/CompiledMetadata.js';

export interface CompiledMetadataRepository {
  save(metadata: CompiledMetadata): TE.TaskEither<Error, CompiledMetadata>;
}
