import * as TE from 'fp-ts/TaskEither';
import Loki from 'lokijs';
import { pipe } from 'fp-ts/function';
import { LokiJSBaseRepository } from '../../tests/infra/utils/LokiJSBaseRepository.js';
import {
  FileMetadataEntity,
  mapFileMetadataEntityToFileMetadata,
  mapFileMetadataToFileMetadataEntity,
} from './FileMetadataEntity.js';
import FileMetadataRepository, {
  FilterFileMetadata,
} from '../../domain/restore/FileMetadataRepository.js';
import FileMetadata from 'domain/sharedkernel/metadata/FileMetadata.js';

const fileMetadata = 'file_metadata';

class LokiJSFileMetadataRepository
  extends LokiJSBaseRepository<FileMetadataEntity>
  implements FileMetadataRepository
{
  constructor(db: Loki) {
    super(db, fileMetadata);
  }

  getPageBy(
    page: number,
    filter: FilterFileMetadata,
    pageSize: number,
  ): TE.TaskEither<Error, Array<FileMetadata>> {
    return pipe(
      this.findPaginated(this.buildQuery(filter), page, pageSize),
      TE.map((entities) => entities.map(mapFileMetadataEntityToFileMetadata)),
    );
  }
  getTotalBy(
    filter: FilterFileMetadata,
    pageSize: number,
  ): TE.TaskEither<Error, number> {
    return this.getTotal(this.buildQuery(filter), pageSize);
  }

  save(fileMetadata: FileMetadata): TE.TaskEither<Error, FileMetadata> {
    return pipe(
      TE.of(mapFileMetadataToFileMetadataEntity(fileMetadata)),
      TE.chain((entity) => this.saveOrUpdate({ _id: entity._id }, entity)),
      TE.map(mapFileMetadataEntityToFileMetadata),
    );
  }

  private buildQuery(
    filter: FilterFileMetadata,
  ): LokiQuery<FileMetadataEntity> {
    const query: LokiQuery<FileMetadataEntity> = {};

    if (filter.id) {
      query._id = filter.id;
    }

    return query;
  }
}

export default LokiJSFileMetadataRepository;
