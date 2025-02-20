import * as TE from 'fp-ts/lib/TaskEither.js';
import FileMetadata from '../sharedkernel/metadata/FileMetadata.js';
import { NumberPage } from '../../tests/infra/utils/LokiJSBaseRepository.js';

export type FilterFileMetadata = {
  id?: string;
};

interface FileMetadataRepository {
  save(metadata: FileMetadata): TE.TaskEither<Error, FileMetadata>;
  saveAll(
    metadata: Array<FileMetadata>,
  ): TE.TaskEither<Error, Array<FileMetadata>>;
  getTotalBy(
    filter: FilterFileMetadata,
    pageSize: number,
  ): TE.TaskEither<Error, NumberPage>;
  getPageBy(
    page: number,
    filter: FilterFileMetadata,
    pageSize: number,
  ): TE.TaskEither<Error, Array<FileMetadata>>;
}

export default FileMetadataRepository;
