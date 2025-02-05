import { it, describe, expect, beforeAll, afterAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import {
  base64Image,
  writeBase64ImageToFile,
  writeExifData,
} from '../../../shared/utils/test/Image.js';
import { ExifDateTime } from 'exiftool-vendored';
import exif from '../../../../domain/shared/extractor/Exif.js';
import { expectRight } from '../../../shared/utils/test/Expected.js';
import FileMetadata from '../../../../domain/sharedkernel/metadata/FileMetadata.js';

describe('Exif Extractor', () => {
  const testDir = path.join(__dirname, 'exif_extractor');
  const testImagePath = path.join(testDir, 'test.jpg');

  beforeAll(async () => {
    fs.mkdirSync(testDir, { recursive: true });
    writeBase64ImageToFile(base64Image, testImagePath);

    await writeExifData(testImagePath, {
      Make: 'TestCamera',
      Model: 'TestModel',
      DateTimeOriginal: ExifDateTime.fromEXIF(
        '2023:10:01 12:34:56',
        'Europe/Paris',
      ),
      GPSLatitude: 48.8566,
      GPSLongitude: 2.3522,
    })();
  });

  afterAll(async () => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should extract EXIF data from an image file', async () => {
    const result = await exif.extract(testImagePath)();

    expectRight(result, (metadata: Partial<FileMetadata>) => {
      expect(metadata?.exif).toBeDefined();
    });
  });
});
