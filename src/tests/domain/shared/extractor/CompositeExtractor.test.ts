import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { ExifDateTime } from 'exiftool-vendored';
import {
  base64Image,
  writeBase64ImageToFile,
  writeExifData,
} from '../../../shared/utils/test/Image.js';
import dateTimeOriginal from '../../../../domain/shared/extractor/DateTimeOriginal.js';
import { deleteFileOrDirectory } from '../../../shared/utils/test/Filesystem.js';
import { expectRight } from '../../../shared/utils/test/Expected.js';
import exif from '../../../../domain/shared/extractor/Exif.js';
import compositeExtractor from '../../../../domain/shared/extractor/CompositeExtractor.js';
import FileMetadata from '../../../../domain/sharedkernel/metadata/FileMetadata.js';

describe('Composite Extractor', () => {
  const testDir = path.join(__dirname, 'composite_extractor');
  const testImagePath = path.join(testDir, 'test.jpg');
  const testNoExifImagePath = path.join(testDir, 'test_no_exif.jpg');
  const testDateTimeOriginalPath = path.join(
    testDir,
    'test_date_time_original.jpg',
  );
  const date = ExifDateTime.fromISO('2023:10:01 12:34:56', 'Europe/Paris');

  beforeAll(async () => {
    fs.mkdirSync(testDir, { recursive: true });

    writeBase64ImageToFile(base64Image, testImagePath);
    await writeExifData(testImagePath, {
      Make: 'TestCamera',
      Model: 'TestModel',
      DateTimeOriginal: date,
      GPSLatitude: 48.8566,
      GPSLongitude: 2.3522,
    })();

    writeBase64ImageToFile(base64Image, testNoExifImagePath);

    writeBase64ImageToFile(base64Image, testDateTimeOriginalPath);
    await writeExifData(testDateTimeOriginalPath, {
      DateTimeOriginal: date,
    })();
  });

  afterAll(async () => {
    await deleteFileOrDirectory(testDir);
  });

  it('should combine multiple extractors and aggregate metadata for valid EXIF file', async () => {
    const extractors = [exif];
    const extractor = compositeExtractor(extractors);

    const result = await extractor(testImagePath)();

    expectRight(result, (metadata: Partial<FileMetadata>) => {
      expect(metadata.filename).toBe('test.jpg');
      expect(metadata.name).toBe(path.parse(testImagePath).name);
      expect(metadata.fullPath).toBe(`${testImagePath}`);
      expect(metadata.extension).toBe(path.extname(testImagePath));
      expect(metadata.type).toBe('PHOTO');
      expect(metadata.exif).toBeDefined();
      expect(metadata.exif?.['Make']).toBe('TestCamera');
      expect(metadata.exif?.['Model']).toBe('TestModel');
    });
  });

  it('should handle a valid image file without specif EXIF metadata', async () => {
    const extractors = [exif];
    const extractor = compositeExtractor(extractors);

    const result = await extractor(testNoExifImagePath)();

    expectRight(result, (metadata: Partial<FileMetadata>) => {
      expect(metadata.filename).toBe('test_no_exif.jpg');
      expect(metadata.name).toBe(path.parse(testNoExifImagePath).name);
      expect(metadata.fullPath).toBe(`${testNoExifImagePath}`);
      expect(metadata.extension).toBe(path.extname(testNoExifImagePath));
      expect(metadata.exif?.dateTimeOriginal).toBeUndefined();
    });
  });

  it('should combine results of multiple extractors including DateTimeOriginal', async () => {
    const extractors = [exif, dateTimeOriginal];
    const extractor = compositeExtractor(extractors);

    const result = await extractor(testImagePath)();

    expectRight(result, (metadata: Partial<FileMetadata>) => {
      expect(metadata.filename).toBe('test.jpg');
      expect(metadata.exif).toBeDefined();
      expect(metadata.exif!.dateTimeOriginal).toEqual(date);
    });
  });

  it('should work with DateTimeOriginal extractor for a specific file', async () => {
    const extractors = [dateTimeOriginal];
    const extractor = compositeExtractor(extractors);

    const result = await extractor(testDateTimeOriginalPath)();

    expectRight(result, (metadata: Partial<FileMetadata>) => {
      expect(metadata.filename).toBe('test_date_time_original.jpg');
      expect(metadata.name).toBe(path.parse(testDateTimeOriginalPath).name);
      expect(metadata.fullPath).toBe(`${testDateTimeOriginalPath}`);
      expect(metadata.extension).toBe(path.extname(testDateTimeOriginalPath));
      expect(metadata.exif).toBeDefined();
      expect(metadata.exif!.dateTimeOriginal).toEqual(date);
    });
  });
});
