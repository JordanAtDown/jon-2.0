import * as TE from 'fp-ts/TaskEither';
import FileMetadata from './FileMetadata';

interface FileMetadataRepository {
  save(metadata: FileMetadata): TE.TaskEither<Error, FileMetadata>;
}

export default FileMetadataRepository;
