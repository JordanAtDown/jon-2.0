import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ExifDateTime } from 'exiftool-vendored';
import LokiJSFileMetadataRepository from '../../../infra/restore/LokiJSFileMetadataRepository.js';
import { deleteFileOrDirectory } from '../../shared/utils/test/Filesystem.js';
import FileMetadata from '../../../domain/sharedkernel/metadata/FileMetadata.js';
import { expectRight } from '../../shared/utils/test/Expected.js';
import FileMetadataDBHelper from '../utils/FileMetadataDDBHelper.js';
import initializeDB from '../utils/InitializeDB.js';
import { FileMetadataEntity } from '../../../infra/restore/FileMetadataEntity.js';
import { DATABASES } from '../../../infra/shared/config/Database.js';
import path from 'path';
import { DatabaseConfiguration } from '../../../infra/shared/config/DatabaseConfiguration.js';

describe('LokiJSFileMetadataRepository', () => {
  const tempDir = path.join(__dirname, 'lokiJSFileMetadataRepository');
  let repository: LokiJSFileMetadataRepository;
  let helper: FileMetadataDBHelper;
  let dbConfig: DatabaseConfiguration;

  beforeAll(async () => {
    dbConfig = await initializeDB(tempDir);
    repository = new LokiJSFileMetadataRepository(
      dbConfig.getDatabase(DATABASES.FILE_METADATA.id),
      DATABASES.FILE_METADATA,
    );
    helper = new FileMetadataDBHelper(
      dbConfig.getDatabase(DATABASES.FILE_METADATA.id),
      DATABASES.FILE_METADATA,
    );
  });

  afterEach(async () => {
    await dbConfig.clearAllCollections();
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
    const fileMetadata2: FileMetadataEntity = {
      _id: 'images/images2.jpg',
      filename: 'images2.jpg',
      fullPath: 'images/images2.jpg',
      directory: 'images',
      name: 'images2',
      extension: '.jpg',
      type: 'images',
    };
    const fileMetadata3: FileMetadataEntity = {
      _id: 'images/images3.jpg',
      filename: 'images3.jpg',
      fullPath: 'images/images3.jpg',
      directory: 'images',
      name: 'images3',
      extension: '.jpg',
      type: 'images',
    };
    const fileMetadata4: FileMetadataEntity = {
      _id: 'images/images4.jpg',
      filename: 'images4.jpg',
      fullPath: 'images/images4.jpg',
      directory: 'images',
      name: 'images4',
      extension: '.jpg',
      type: 'images',
    };
    const fileMetadata5: FileMetadataEntity = {
      _id: 'images/images5.jpg',
      filename: 'images5.jpg',
      fullPath: 'images/images5.jpg',
      directory: 'images',
      name: 'images5',
      extension: '.jpg',
      type: 'images',
    };
    await helper.addAll([
      fileMetadata1,
      fileMetadata2,
      fileMetadata3,
      fileMetadata4,
      fileMetadata5,
    ])();

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
    const fileMetadata2: FileMetadataEntity = {
      _id: 'images/images2.jpg',
      filename: 'images2.jpg',
      fullPath: 'images/images2.jpg',
      directory: 'images',
      name: 'images2',
      extension: '.jpg',
      type: 'images',
    };
    const fileMetadata3: FileMetadataEntity = {
      _id: 'images/images3.jpg',
      filename: 'images3.jpg',
      fullPath: 'images/images3.jpg',
      directory: 'images',
      name: 'images3',
      extension: '.jpg',
      type: 'images',
    };
    const fileMetadata4: FileMetadataEntity = {
      _id: 'images/images4.jpg',
      filename: 'images4.jpg',
      fullPath: 'images/images4.jpg',
      directory: 'images',
      name: 'images4',
      extension: '.jpg',
      type: 'images',
    };
    const fileMetadata5: FileMetadataEntity = {
      _id: 'images/images5.jpg',
      filename: 'images5.jpg',
      fullPath: 'images/images5.jpg',
      directory: 'images',
      name: 'images5',
      extension: '.jpg',
      type: 'images',
    };
    await helper.addAll([
      fileMetadata1,
      fileMetadata2,
      fileMetadata3,
      fileMetadata4,
      fileMetadata5,
    ])();
    // const taskEither = helper.find({});
    // await expectTaskEitherRight(
    //   taskEither,
    //   (entities: FileMetadataEntity[]) => {
    //     expect(entities.length).toHaveLength(5);
    //   },
    // );
    const result = await repository.getTotalBy({}, 2)();

    expectRight(result, (total) => {
      expect(total.totalPages).toBe(3);
      expect(total.totalItem).toBe(5);
    });
  });
});
