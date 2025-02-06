import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as path from 'path';
import { ExifDateTime } from 'exiftool-vendored';
import MoveAndCatalogFileUseCase from '../../../domain/catalog/usecase/MoveAndCatalogFileUseCase.js';
import fastGlobScanner from '../../../infra/shared/filesystem/FastGlobScanner.js';
import MoveAndCatalogFileCommand from '../../../domain/catalog/usecase/MoveAndCatalogFileCommand.js';
import {
  expectTaskEitherLeft,
  expectTaskEitherRight,
} from '../../shared/utils/test/Expected.js';
import {
  base64Image,
  extractExifProperties,
  writeBase64ImageToFile,
  writeExifData,
} from '../../shared/utils/test/Image';
import {
  createFileStructure,
  deleteFileOrDirectory,
  FileStructure,
  findFiles,
} from '../../shared/utils/test/Filesystem';

describe('MoveAndCatalogFileUseCase', () => {
  const tempDir = path.join(__dirname, 'MoveAndCatalogFileUseCase');
  const ROOT_DIR = path.join(tempDir, 'root');
  const DEST_DIR = path.join(tempDir, 'dest');

  beforeAll(async () => {
    const fileStructure: FileStructure = {
      images: {
        '2016-08-08 19.28.33.jpg': '',
        'image2.jpg': '',
        'image3.jpg': '',
      },
    };

    await createFileStructure(ROOT_DIR, fileStructure);

    const image1 = path.join(ROOT_DIR, 'images', '2016-08-08 19.28.33.jpg');
    const image2 = path.join(ROOT_DIR, 'images', 'image2.jpg');
    const image3 = path.join(ROOT_DIR, 'images', 'image3.jpg');
    writeBase64ImageToFile(base64Image, image1);
    writeBase64ImageToFile(base64Image, image2);
    writeBase64ImageToFile(base64Image, image3);

    await writeExifData(image1, {
      Make: 'CameraWithoutDate',
      Model: 'NoDateModel',
    })();

    await writeExifData(image2, {
      Make: 'UndefinedDateCamera',
      Model: 'UndefinedDateModel',
      DateTimeOriginal: undefined,
    })();

    await writeExifData(image3, {
      Make: 'CameraWithDate',
      Model: 'ValidDateModel',
      DateTimeOriginal: ExifDateTime.fromEXIF(
        '2023:07:15 12:34:56',
        'Europe/Paris',
      ),
    })();
  });

  afterAll(async () => {
    await deleteFileOrDirectory(tempDir);
  });

  it('should move and catalog files', async () => {
    // GIVEN
    const useCase = new MoveAndCatalogFileUseCase(fastGlobScanner, []);
    const command: MoveAndCatalogFileCommand = {
      rootDirectory: ROOT_DIR,
      destinationDirectory: DEST_DIR,
      extensions: ['IMAGE'],
      batchSize: 2,
      progress: () => {},
      itemCallback: () => {},
    };

    // WHEN
    await useCase.moveAndCatalogFile(command)();

    // THEN
    //// Find files in destination directory
    const expectedFiles = [
      path.join(DEST_DIR, '2016', '08', 'PHOTO_2016_08_08-19_28_33.jpg'),
      path.join(DEST_DIR, '2023', '07', 'PHOTO_2023_07_15-12_34_56.jpg'),
    ];
    const files = await findFiles(`${DEST_DIR}/**/*`);
    expect(files.length).toEqual(2);
    expect(files).toEqual(expect.arrayContaining(expectedFiles));

    //// Check EXIF properties
    const extract01 = extractExifProperties(
      path.join(DEST_DIR, '2016', '08', 'PHOTO_2016_08_08-19_28_33.jpg'),
      ['DateTimeOriginal'],
    );
    await expectTaskEitherRight(extract01, (exifData) => {
      expect(exifData['DateTimeOriginal']).instanceOf(ExifDateTime);
      expect((exifData['DateTimeOriginal'] as ExifDateTime).toISOString()).toBe(
        '2016-08-08T19:28:33',
      );
    });
    const extract02 = extractExifProperties(
      path.join(DEST_DIR, '2023', '07', 'PHOTO_2023_07_15-12_34_56.jpg'),
      ['DateTimeOriginal'],
    );
    await expectTaskEitherRight(extract02, (exifData) => {
      expect(exifData['DateTimeOriginal']).instanceOf(ExifDateTime);
      expect((exifData['DateTimeOriginal'] as ExifDateTime).toISOString()).toBe(
        '2023-07-15T12:34:56',
      );
    });

    //// Check original files are remove
    const notIn: string[] = [
      path.join(ROOT_DIR, 'images', '2016-08-08 19.28.33.jpg'),
      path.join(ROOT_DIR, 'images', 'image3.jpg'),
    ];
    const onlyIn: string = path.join(ROOT_DIR, 'images', 'image2.jpg');
    const srcFiles = await findFiles(`${ROOT_DIR}/**/*.jpg`);
    expect(srcFiles).toHaveLength(1);
    expect(srcFiles).includes(onlyIn);
    expect(srcFiles).not.equals(expect.arrayContaining(notIn));
  });
});
