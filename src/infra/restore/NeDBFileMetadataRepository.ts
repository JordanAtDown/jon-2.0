import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import {
  FileMetadataEntity,
  mapFileMetadataEntityToFileMetadata,
  mapFileMetadataToFileMetadataEntity,
} from './FileMetadataEntity';
import FileMetadataRepository from '../../domain/restore/FileMetadataRepository';
import { BaseRepository } from '../shared/utils/BaseRepository';
import FileMetadata from '../../domain/restore/FileMetadata';

class NeDBFileMetadataRepository
  extends BaseRepository<FileMetadataEntity>
  implements FileMetadataRepository
{
  save(fileMetadata: FileMetadata): TE.TaskEither<Error, FileMetadata> {
    return pipe(
      TE.of(mapFileMetadataToFileMetadataEntity(fileMetadata)),
      TE.chain((entity) => this.saveOrUpdate(entity, { _id: entity._id })),
      TE.map(mapFileMetadataEntityToFileMetadata),
    );
  }
}

export default NeDBFileMetadataRepository;
