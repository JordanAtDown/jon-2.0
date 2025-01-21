import Metadata from '../../domain/catalog/Metadata';
import Tags from '../../domain/shared/tag/Tags';

type CompileMetadataEntity = {
  _id: string;
  fullPath: string;
  tags: string[];
  destinationFolder: string;
  year?: number;
  month?: number;
  hasExif: boolean;
  newName: string;
};

const mapCompileMetadataEntityToMetadata = (
  entity: CompileMetadataEntity,
): Metadata => ({
  fullPath: entity.fullPath,
  tags: entity.tags as Tags,
  destinationFolder: entity.destinationFolder,
  year: entity.year,
  month: entity.month,
  hasExif: entity.hasExif,
  newName: entity.newName,
});

const mapCompiledMetadataToCompileMetadataEntity = (
  metadata: Metadata,
): CompileMetadataEntity => ({
  _id: metadata.fullPath,
  fullPath: metadata.fullPath,
  tags: metadata.tags,
  destinationFolder: metadata.destinationFolder,
  year: metadata.year,
  month: metadata.month,
  hasExif: metadata.hasExif,
  newName: metadata.newName,
});

export {
  CompileMetadataEntity,
  mapCompileMetadataEntityToMetadata,
  mapCompiledMetadataToCompileMetadataEntity,
};
