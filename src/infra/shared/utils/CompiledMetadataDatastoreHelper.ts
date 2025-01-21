import { CompileMetadataEntity } from '../../sharedkernel/CompileMetadataEntity';
import { BaseRepository } from './BaseRepository';

class CompiledMetadataDatastoreHelper extends BaseRepository<CompileMetadataEntity> {
  /**
   * Creates a `CompiledMetadataEntity` object with default values, allowing overrides.
   *
   * @param overrides - Partial fields to customize the metadata.
   * @returns A complete `CompiledMetadata` object.
   */
  public createCompileMetadataEntity(
    overrides: Partial<CompileMetadataEntity> = {},
  ): CompileMetadataEntity {
    return {
      _id: 'default_id',
      fullPath: '/default/path/file.jpg',
      tags: ['defaultTag1', 'defaultTag2'],
      destinationFolder: '/2023/10',
      year: 2023,
      month: 10,
      hasExif: true,
      newName: 'default_file.jpg',
      ...overrides,
    };
  }
}

export default CompiledMetadataDatastoreHelper;
