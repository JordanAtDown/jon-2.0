import * as TE from 'fp-ts/lib/TaskEither.js';
import FileMetadata from '../sharedkernel/metadata/FileMetadata.js';

export type FilterFileMetadata = {
  id?: string;
};

interface FileMetadataRepository {
  save(metadata: FileMetadata): TE.TaskEither<Error, FileMetadata>;
  getTotalBy(
    filter: FilterFileMetadata,
    pageSize: number,
  ): TE.TaskEither<Error, number>;
  getPageBy(
    page: number,
    filter: FilterFileMetadata,
    pageSize: number,
  ): TE.TaskEither<Error, Array<FileMetadata>>;
}

export default FileMetadataRepository;
