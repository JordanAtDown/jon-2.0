import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ExifPropertyBuilder } from '../../../../domain/shared/exif/ExifProperty.js';
import exifApplyTo from '../../../../domain/shared/exif/ExifWriting.js';
import {
  expectTaskEitherLeft,
  expectTaskEitherRight,
} from '../../../shared/utils/test/Expected.js';
import { ExifDateTime } from 'exiftool-vendored';
import {
  base64Image,
  extractExifProperties,
  writeBase64ImageToFile,
} from '../../../shared/utils/test/Image.js';
import { deleteFileOrDirectory } from '../../../shared/utils/test/Filesystem.js';

const TEST_DIR = path.join(__dirname, 'test-output');
const TEST_IMAGE_PATH = path.join(TEST_DIR, 'testImage.jpg');

beforeAll(async () => {
  await fs.mkdir(TEST_DIR, { recursive: true });
  writeBase64ImageToFile(base64Image, TEST_IMAGE_PATH);
});

afterAll(async () => {
  await deleteFileOrDirectory(TEST_DIR);
});

describe('ExifWriting', () => {
  it('should write valid EXIF metadata to the image', async () => {
    const makeProperty = new ExifPropertyBuilder<string>('Make')
      .withValueGetter(() => 'Test Camera Maker')
      .withValidator((value) => value.length > 0)
      .withErrorMessage('Make must be a non-empty string.')
      .build();
    const dateProperty = new ExifPropertyBuilder<string>('DateTimeOriginal')
      .withValueGetter(() => '2023-11-01T10:00:00')
      .withValidator((value) => !isNaN(Date.parse(value)))
      .withErrorMessage('DateTimeOriginal is invalid.')
      .build();
    const exifProperties = [makeProperty, dateProperty];

    const taskEitherResult = exifApplyTo(TEST_IMAGE_PATH, exifProperties);
    await expectTaskEitherRight(taskEitherResult, (_) => {});

    const extract = extractExifProperties(TEST_IMAGE_PATH, [
      'Make',
      'DateTimeOriginal',
    ]);
    await expectTaskEitherRight(extract, (exifData: Record<string, any>) => {
      expect(exifData['Make']).toBe('Test Camera Maker');
      expect(exifData['DateTimeOriginal']).instanceOf(ExifDateTime);
      expect((exifData['DateTimeOriginal'] as ExifDateTime).toISOString()).toBe(
        '2023-11-01T10:00:00',
      );
    });
  });

  it('should fail if the image file does not exist', async () => {
    const makeProperty = new ExifPropertyBuilder<string>('Make')
      .withValueGetter(() => 'Test Camera Maker')
      .withValidator((value) => value.length > 0)
      .withErrorMessage('Make must be a non-empty string.')
      .build();

    const dateProperty = new ExifPropertyBuilder<string>('DateTimeOriginal')
      .withValueGetter(() => '2023-11-01T10:00:00')
      .withValidator((value) => !isNaN(Date.parse(value)))
      .withErrorMessage('DateTimeOriginal is invalid.')
      .build();

    const exifProperties = [makeProperty, dateProperty];

    const nonexistentFilePath = path.join(TEST_DIR, 'nonexistent.jpg');
    const result = exifApplyTo(nonexistentFilePath, exifProperties);

    await expectTaskEitherLeft(result, (error: Error) => {
      expect(error.message).toMatch(/FAILED_EXIF_WRITE/);
    });
  });
});
