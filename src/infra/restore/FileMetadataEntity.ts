import FileMetadata from '../../domain/restore/FileMetadata';

type FileMetadataEntity = {
  _id: string;
  name: string;
  fullPath: string;
  directory: string;
  extension: string;
  [property: string]: unknown;
};

const mapFileMetadataToFileMetadataEntity = (
  fileMetadata: FileMetadata,
): FileMetadataEntity => {
  const { name, fullPath, directory, extension, ...dynamicProperties } =
    fileMetadata;

  return {
    _id: fullPath,
    name,
    fullPath,
    directory,
    extension,
    ...dynamicProperties,
  };
};

const mapFileMetadataEntityToFileMetadata = (
  fileMetadataEntity: FileMetadataEntity,
): FileMetadata => {
  const { _id, name, fullPath, directory, extension, ...dynamicProperties } =
    fileMetadataEntity;

  return {
    name,
    fullPath,
    directory,
    extension,
    ...dynamicProperties,
  };
};

export {
  mapFileMetadataToFileMetadataEntity,
  FileMetadataEntity,
  mapFileMetadataEntityToFileMetadata,
};
