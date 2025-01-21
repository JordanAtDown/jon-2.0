import * as fs from 'fs';
import { ExifDateTime, exiftool } from 'exiftool-vendored';
import { tryCatchTask } from '../fp/FP';

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
) => tryCatchTask(() => exiftool.write(filePath, exifData));

export { base64Image, writeBase64ImageToFile };
