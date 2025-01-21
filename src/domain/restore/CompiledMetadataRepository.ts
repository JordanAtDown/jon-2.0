import * as TE from 'fp-ts/TaskEither';
import CompiledMetadata from './CompiledMetadata';

export interface CompiledMetadataRepository {
  save(metadata: CompiledMetadata): TE.TaskEither<Error, CompiledMetadata>;
}
