import * as fs from 'fs';
import { ExifDateTime, exiftool } from 'exiftool-vendored';
import { tryCatchTask } from '../../../../domain/shared/utils/fp/FP.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as TE from 'fp-ts/lib/TaskEither.js';

/**
 * Base64 representing a minimal JPEG image.
 */
const base64Image = `
/9j/4AAQSkZJRgABAQEAAAAAAAD/4QCcRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAA
AAALLAAAAAEAAABCAAAAAREzODkAAAEAAQABAAAAAAIBAwABAAAAAQAAAGmHBAABAAAACgEAABIB
AwABAAAAAQAAAEoCAwABAAAAAQMAAAACBQABAAAAAQAAGKACAAQAAAABAAEAAKADAAQAAAABAAEA
AP/EABYBAAMBAQEAAAAAAAAAAAAAAAABAgMEBP/aAAwDAQACEQMRAD8Ar8NTTwo8qezuUxLljcM
TngcvkCYB+XNO6zbgap81xtfsNLKFMQEFM05LLkoLgez632J/CLaoxjEgVn5NeW3mn4Gre3rQTP
/qwFpQeaKhfQy6cC5TpWqFaT6VLT2pTpeVoIqslf+T9Mp5ir9Jan6Zo4/u90TXrXdUKivQqvbap
IlukoUykVEKUFoLyoNOqsXaCoV2VLPSjqQP3oCuH6rFAEfcfRIcip6pzdojHGOPMf/Z`;

/**
 * Utility function to write an image file from a Base64 string.
 * @param base64 - Base64 string representing the image.
 * @param filePath - Path where to write the file.
 */
const writeBase64ImageToFile = (base64: string, filePath: string) => {
  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(filePath, buffer);
};

/**
 * Utility function to write EXIF metadata to an image file.
 * @param filePath - Path of the image file to update.
 * @param exifData - EXIF metadata to write to the image.
 * @returns A TaskEither that encapsulates success or failure.
 */
export const writeExifData = (
  filePath: string,
  exifData: {
    Make?: string;
    Model?: string;
    DateTimeOriginal?: ExifDateTime;
    GPSLatitude?: number;
    GPSLongitude?: number;
  },
) =>
  tryCatchTask(() =>
    exiftool.write(filePath, exifData, { writeArgs: ['-overwrite_original'] }),
  );

/**
 * Utility function to retrieve specific EXIF metadata values from an image file.
 * @param filePath - Path of the image file.
 * @param properties - Array of EXIF property names to extract.
 * @returns A Promise containing an object with the properties and their values.
 */
export const extractExifProperties = (
  filePath: string,
  properties: string[],
) => {
  return pipe(
    tryCatchTask(() => exiftool.read(filePath)),
    TE.map((exifData) => {
      const extractedProperties: Record<string, any> = {};
      properties.forEach((prop) => {
        extractedProperties[prop] = (exifData as Record<string, any>)[prop];
      });
      return extractedProperties;
    }),
  );
};

export { base64Image, writeBase64ImageToFile };
