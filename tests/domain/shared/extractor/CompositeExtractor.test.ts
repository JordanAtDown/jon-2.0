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
import compositeExtractor from '../../../../src/domain/shared/extractor/CompositeExtractor';

describe('Composite Extractor', () => {
  const testDir = path.join(__dirname, 'composite_extractor');
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

  it('should combine multiple extractors and aggregate metadata', async () => {
    const extractors = [exif];
    const extractor = compositeExtractor(extractors);

    const result = await extractor(testImagePath)();

    expectRight(result, (metadata: Partial<FileMetadata>) => {
      expect(metadata.name).toBe(path.parse(testImagePath).name);
      expect(metadata.fullPath).toBe(path.dirname(testImagePath));
      expect(metadata.extension).toBe(path.extname(testImagePath));
      expect(metadata?.exif).toBeDefined();
    });
  });
});
