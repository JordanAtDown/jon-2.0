import FileMetadata from '../../domain/sharedkernel/metadata/FileMetadata.js';
import ExifMetadata from '../../domain/sharedkernel/metadata/ExifMetadata.js';
import { DateTime } from 'luxon';

type FileMetadataEntity = {
  _id: string;
  filename: string;
  name: string;
  fullPath: string;
  directory: string;
  extension: string;
  type: string;
  exif?: ExifMetadataEntity;
};

type ExifMetadataEntity = {
  dateTimeOriginal?: string;
  [property: string]: unknown;
};

const mapExifMetadataToExifMetadataEntity = (
  exifMetadata: ExifMetadata | undefined,
): ExifMetadataEntity | undefined => {
  if (!exifMetadata) return undefined;

  const { dateTimeOriginal, ...dynamicProperties } = exifMetadata;

  return {
    dateTimeOriginal: dateTimeOriginal
      ? (dateTimeOriginal.toISO() ?? undefined)
      : undefined,
    ...dynamicProperties,
  };
};

const mapExifMetadataEntityToExifMetadata = (
  exifMetadataEntity: ExifMetadataEntity | undefined,
): ExifMetadata | undefined => {
  if (!exifMetadataEntity) return undefined;

  const { dateTimeOriginal, ...dynamicProperties } = exifMetadataEntity;

  return {
    dateTimeOriginal: dateTimeOriginal
      ? DateTime.fromISO(dateTimeOriginal)
      : undefined,
    ...dynamicProperties,
  };
};

const mapFileMetadataToFileMetadataEntity = (
  fileMetadata: FileMetadata,
): FileMetadataEntity => {
  const { filename, name, fullPath, directory, extension, exif, type } =
    fileMetadata as FileMetadata & { exif?: ExifMetadata };

  return {
    _id: fullPath,
    filename,
    name,
    type,
    fullPath,
    directory,
    extension,
    exif: mapExifMetadataToExifMetadataEntity(exif),
  };
};

const mapFileMetadataEntityToFileMetadata = (
  fileMetadataEntity: FileMetadataEntity,
): FileMetadata => {
  const { filename, name, fullPath, directory, extension, exif, type } =
    fileMetadataEntity;

  return new FileMetadata(
    filename,
    name,
    fullPath,
    directory,
    extension,
    type,
    mapExifMetadataEntityToExifMetadata(exif),
  );
};

export {
  mapFileMetadataToFileMetadataEntity,
  mapFileMetadataEntityToFileMetadata,
  mapExifMetadataToExifMetadataEntity,
  mapExifMetadataEntityToExifMetadata,
  FileMetadataEntity,
  ExifMetadataEntity,
};
