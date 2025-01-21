import { describe, it, beforeAll, afterAll, expect, afterEach } from 'vitest';
import initializeDatabase from '../../../src/infra/shared/utils/InitializeDatabase';
import { deleteFileOrDirectory } from '../../../src/domain/shared/utils/test/Filesystem';
import NeDBFileMetadataRepository from '../../../src/infra/restore/NeDBFileMetadataRepository';
import FileMetadataDatastoreHelper from '../../../src/infra/shared/utils/FileMetadataDatastoreHelper';
import { expectRight } from '../../../src/domain/shared/utils/test/Expected';
import { ExifDateTime } from 'exiftool-vendored';

describe('NeDBFileMetadataRepository', () => {
  const testDbPath = './temp/NeDBFileMetadataRepository/';
  let repository: NeDBFileMetadataRepository;
  let helper: FileMetadataDatastoreHelper;

  beforeAll(async () => {
    const dbConfig = await initializeDatabase(testDbPath);
    const fileMetadataDB = dbConfig.fileMetadataDB;
    repository = new NeDBFileMetadataRepository(fileMetadataDB);
    helper = new FileMetadataDatastoreHelper(fileMetadataDB);
  });

  afterEach(async () => {
    helper.delete({});
  });

  afterAll(async () => {
    await deleteFileOrDirectory(testDbPath);
  });

  it('should successfully save valid file metadata', async () => {
    const fileMetadata = {
      name: 'file.txt',
      fullPath: '/files/file.txt',
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
    };

    const result = await repository.save(fileMetadata)();

    expectRight(result, (savedMetadata) => {
      expect(savedMetadata).toEqual(fileMetadata);
    });

    const saved = await helper.find({ _id: fileMetadata.fullPath })();
    expectRight(saved, (entity) => {
      expect(entity).toHaveLength(1);
      expect(entity[0]).toMatchObject({
        _id: fileMetadata.fullPath,
        name: 'file.txt',
        fullPath: '/files/file.txt',
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

  it('should overwrite existing metadata with the same ID', async () => {});
});
