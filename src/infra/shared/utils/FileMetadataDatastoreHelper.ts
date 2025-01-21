import { CompileMetadataEntity } from '../../sharedkernel/CompileMetadataEntity';
import { BaseRepository } from './BaseRepository';
import { FileMetadataEntity } from '../../restore/FileMetadataEntity';

class FileMetadataDatastoreHelper extends BaseRepository<FileMetadataEntity> {}

export default FileMetadataDatastoreHelper;
