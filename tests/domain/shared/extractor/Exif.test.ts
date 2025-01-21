import { it, describe, expect, beforeAll, afterAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import {
  base64Image,
  writeBase64ImageToFile,
  writeExifData,
} from '../../../../src/domain/shared/utils/test/Image';
import exif from '../../../../src/domain/shared/extractor/Exif';
import { expectRight } from '../../../../src/domain/shared/utils/test/Expected';
import FileMetadata from '../../../../src/domain/restore/FileMetadata';
import { ExifDateTime } from 'exiftool-vendored';

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
