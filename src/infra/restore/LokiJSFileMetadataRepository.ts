import * as TE from 'fp-ts/lib/TaskEither.js';
import Loki from 'lokijs';
import { pipe } from 'fp-ts/lib/function.js';
import {
  LokiJSBaseRepository,
  NumberPage,
} from '../../tests/infra/utils/LokiJSBaseRepository.js';
import {
  FileMetadataEntity,
  mapFileMetadataEntityToFileMetadata,
  mapFileMetadataToFileMetadataEntity,
} from './FileMetadataEntity.js';
import FileMetadataRepository, {
  FilterFileMetadata,
} from '../../domain/restore/FileMetadataRepository.js';
import FileMetadata from '../../domain/sharedkernel/metadata/FileMetadata.js';
import { DatabaseConfig } from '../shared/config/Database.js';
import { RepositoryFactory } from '../../tests/infra/utils/RepositoryFactory.js';

class LokiJSFileMetadataRepository
  extends LokiJSBaseRepository<FileMetadataEntity>
  implements FileMetadataRepository
{
  constructor(db: Loki, database: DatabaseConfig) {
    const collection = RepositoryFactory.createCollection<FileMetadataEntity>(
      db,
      database,
    );
    super(collection);
  }

  saveAll(
    metadatas: Array<FileMetadata>,
  ): TE.TaskEither<Error, Array<FileMetadata>> {
    return pipe(
      metadatas.map(mapFileMetadataToFileMetadataEntity),
      (entities) => this.addAll(entities),
      TE.chain((savedEntities) =>
        pipe(
          savedEntities ?? [],
          (entities) =>
            entities.filter((entity): entity is FileMetadataEntity => !!entity),
          (validEntities) =>
            validEntities.map(mapFileMetadataEntityToFileMetadata),
          (domainModels) => TE.of(domainModels),
        ),
      ),
    );
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
  ): TE.TaskEither<Error, NumberPage> {
    return this.getTotalNumberPage(this.buildQuery(filter), pageSize);
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
