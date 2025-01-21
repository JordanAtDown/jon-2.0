import FileMetadata from '../../domain/restore/FileMetadata';

type FileMetadataEntity = {
  _id: string;
  name: string;
  fullPath: string;
  extension: string;
  [property: string]: unknown;
};

const mapFileMetadataToFileMetadataEntity = (
  fileMetadata: FileMetadata,
): FileMetadataEntity => {
  const { name, fullPath, extension, ...dynamicProperties } = fileMetadata;

  return {
    _id: fullPath,
    name,
    fullPath,
    extension,
    ...dynamicProperties,
  };
};

const mapFileMetadataEntityToFileMetadata = (
  fileMetadataEntity: FileMetadataEntity,
): FileMetadata => {
  const { _id, name, fullPath, extension, ...dynamicProperties } =
    fileMetadataEntity;

  return {
    name,
    fullPath,
    extension,
    ...dynamicProperties,
  };
};

export {
  mapFileMetadataToFileMetadataEntity,
  FileMetadataEntity,
  mapFileMetadataEntityToFileMetadata,
};
