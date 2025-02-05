import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ExifDateTime } from 'exiftool-vendored';
import path from 'path';
import LokiJSFileMetadataRepository from '../../../infra/restore/LokiJSFileMetadataRepository.js';
import { deleteFileOrDirectory } from '../../shared/utils/test/Filesystem.js';
import FileMetadata from '../../../domain/sharedkernel/metadata/FileMetadata.js';
import { expectRight } from '../../shared/utils/test/Expected.js';
import FileMetadataDBHelper from '../utils/FileMetadataDDBHelper.js';
import initializeDB from '../utils/InitializeDB.js';
import { FileMetadataEntity } from '../../../infra/restore/FileMetadataEntity.js';

describe('LokiJSFileMetadataRepository', () => {
  const tempDir = path.join(__dirname, 'lokijscheckpoint');
  let repository: LokiJSFileMetadataRepository;
  let helper: FileMetadataDBHelper;

  beforeEach(async () => {
    const dbConfig = await initializeDB(tempDir);
    const fileMetadataDB = dbConfig.fileMetadataDB;
    repository = new LokiJSFileMetadataRepository(fileMetadataDB);
    helper = new FileMetadataDBHelper(fileMetadataDB);
  });

  afterEach(async () => {
    helper.delete({});
  });

  afterAll(async () => {
    await deleteFileOrDirectory(tempDir);
  });

  it('should successfully save valid file metadata', async () => {
    const fileMetadata = new FileMetadata(
      'file.txt',
      'file',
      '/files/file.txt',
      `${tempDir}files`,
      '.txt',
      'PHOTO',
      {
        Make: 'TestCamera',
        Model: 'TestModel',
        DateTimeOriginal: ExifDateTime.fromEXIF(
          '2023:10:01 12:34:56',
          'Europe/Paris',
        ),
        GPSLatitude: 48.8566,
        GPSLongitude: 2.3522,
      },
    );

    await repository.save(fileMetadata)();

    const saved = await helper.find({})();
    expectRight(saved, (entity) => {
      expect(entity).toHaveLength(1);
      expect(entity[0]).toMatchObject({
        _id: fileMetadata.fullPath,
        name: 'file',
        filename: 'file.txt',
        fullPath: '/files/file.txt',
        directory: `${tempDir}files`,
        extension: '.txt',
        exif: {
          Make: 'TestCamera',
          Model: 'TestModel',
          DateTimeOriginal: ExifDateTime.fromEXIF(
            '2023:10:01 12:34:56',
            'Europe/Paris',
          ),
          GPSLatitude: 48.8566,
          GPSLongitude: 2.3522,
        },
      });
    });
  });

  it('should get total by', async () => {
    const fileMetadata1: FileMetadataEntity = {
      _id: 'images/IMG_20180719_205840_01.jpg',
      filename: 'IMG_20180719_205840_01.jpg',
      fullPath: 'images/IMG_20180719_205840_01.jpg',
      directory: 'images',
      name: 'IMG_20180719_205840_01',
      extension: '.jpg',
      type: 'images',
    };
    await helper.saveOrUpdate(
      {
        _id: 'images/IMG_20180719_205840_01.jpg',
      },
      fileMetadata1,
    )();
    const fileMetadata2: FileMetadataEntity = {
      _id: 'images/images2.jpg',
      filename: 'images2.jpg',
      fullPath: 'images/images2.jpg',
      directory: 'images',
      name: 'images2',
      extension: '.jpg',
      type: 'images',
    };
    await helper.saveOrUpdate(
      {
        _id: 'images/images2.jpg',
      },
      fileMetadata2,
    )();
    const fileMetadata3: FileMetadataEntity = {
      _id: 'images/images3.jpg',
      filename: 'images3.jpg',
      fullPath: 'images/images3.jpg',
      directory: 'images',
      name: 'images3',
      extension: '.jpg',
      type: 'images',
    };
    await helper.saveOrUpdate(
      {
        _id: 'images/images3.jpg',
      },
      fileMetadata3,
    )();
    const fileMetadata4: FileMetadataEntity = {
      _id: 'images/images4.jpg',
      filename: 'images4.jpg',
      fullPath: 'images/images4.jpg',
      directory: 'images',
      name: 'images4',
      extension: '.jpg',
      type: 'images',
    };
    await helper.saveOrUpdate(
      {
        _id: 'images/images4.jpg',
      },
      fileMetadata4,
    )();
    const fileMetadata5: FileMetadataEntity = {
      _id: 'images/images5.jpg',
      filename: 'images5.jpg',
      fullPath: 'images/images5.jpg',
      directory: 'images',
      name: 'images5',
      extension: '.jpg',
      type: 'images',
    };
    await helper.saveOrUpdate(
      {
        _id: 'images/images5.jpg',
      },
      fileMetadata5,
    )();

    const result = await repository.getPageBy(1, {}, 2)();

    expectRight(result, (fileMetadatas) => {
      expect(fileMetadatas).toHaveLength(2);
    });
  });

  it('should get total page', async () => {
    const fileMetadata1: FileMetadataEntity = {
      _id: 'images/IMG_20180719_205840_01.jpg',
      filename: 'IMG_20180719_205840_01.jpg',
      fullPath: 'images/IMG_20180719_205840_01.jpg',
      directory: 'images',
      name: 'IMG_20180719_205840_01',
      extension: '.jpg',
      type: 'images',
    };
    await helper.saveOrUpdate(
      {
        _id: 'images/IMG_20180719_205840_01.jpg',
      },
      fileMetadata1,
    )();
    const fileMetadata2: FileMetadataEntity = {
      _id: 'images/images2.jpg',
      filename: 'images2.jpg',
      fullPath: 'images/images2.jpg',
      directory: 'images',
      name: 'images2',
      extension: '.jpg',
      type: 'images',
    };
    await helper.saveOrUpdate(
      {
        _id: 'images/images2.jpg',
      },
      fileMetadata2,
    )();
    const fileMetadata3: FileMetadataEntity = {
      _id: 'images/images3.jpg',
      filename: 'images3.jpg',
      fullPath: 'images/images3.jpg',
      directory: 'images',
      name: 'images3',
      extension: '.jpg',
      type: 'images',
    };
    await helper.saveOrUpdate(
      {
        _id: 'images/images3.jpg',
      },
      fileMetadata3,
    )();
    const fileMetadata4: FileMetadataEntity = {
      _id: 'images/images4.jpg',
      filename: 'images4.jpg',
      fullPath: 'images/images4.jpg',
      directory: 'images',
      name: 'images4',
      extension: '.jpg',
      type: 'images',
    };
    await helper.saveOrUpdate(
      {
        _id: 'images/images4.jpg',
      },
      fileMetadata4,
    )();
    const fileMetadata5: FileMetadataEntity = {
      _id: 'images/images5.jpg',
      filename: 'images5.jpg',
      fullPath: 'images/images5.jpg',
      directory: 'images',
      name: 'images5',
      extension: '.jpg',
      type: 'images',
    };
    await helper.saveOrUpdate(
      {
        _id: 'images/images5.jpg',
      },
      fileMetadata5,
    )();

    const result = await repository.getTotalBy({}, 2)();

    expectRight(result, (total) => {
      expect(total).toBe(3);
    });
  });
});
