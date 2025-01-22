import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as path from 'path';
import {
  createFileStructure,
  deleteFileOrDirectory,
  FileStructure,
} from '../../../../src/domain/shared/utils/test/Filesystem';
import ExtractFileMetadataUseCase from '../../../../src/domain/restore/usecase/ExtractFileMetadataUseCase';
import NeDBCheckpoint from '../../../../src/infra/sharedkernel/checkpoint/NeDBCheckpoint';
import NeDBFileMetadataRepository from '../../../../src/infra/restore/NeDBFileMetadataRepository';
import initializeDatabase from '../../../../src/infra/shared/utils/InitializeDatabase';
import {
  base64Image,
  writeBase64ImageToFile,
  writeExifData,
} from '../../../../src/domain/shared/utils/test/Image';
import FastGlobScanner from '../../../../src/infra/shared/filesystem/FastGlobScanner';
import exif from '../../../../src/domain/shared/extractor/Exif';
import { expectRight } from '../../../../src/domain/shared/utils/test/Expected';
import CheckpointDatastoreHelper from '../../../../src/infra/shared/utils/CheckpointDatastoreHelper';
import FileMetadataDatastoreHelper from '../../../../src/infra/shared/utils/FileMetadataDatastoreHelper';
import { ExifDateTime } from 'exiftool-vendored';
import CheckpointEntity from '../../../../src/infra/sharedkernel/checkpoint/CheckpointEntity';
import { FileMetadataEntity } from '../../../../src/infra/restore/FileMetadataEntity';

describe('ExtractFileMetadataUseCase', () => {
  const tempDir = path.join(__dirname, 'metadata_extraction');

  const fileStructure: FileStructure = {
    images: {
      'photo1.jpg': '',
      'photo2.jpg': '',
      'photo3.jpg': '',
    },
    others: {
      'file1.txt': 'Fichier texte non pertinent',
      'video.mp4': '',
    },
  };
  let useCase: ExtractFileMetadataUseCase;
  let checkpointHelper: CheckpointDatastoreHelper;
  let fileMetadataHelper: FileMetadataDatastoreHelper;
  let dbPath: string;

  const dateTimeOriginal = ExifDateTime.fromEXIF(
    '2021:05:20 14:30:00',
    'Europe/Paris',
  );
  beforeAll(async () => {
    dbPath = path.join(tempDir, 'db');
    const dbConfig = await initializeDatabase(dbPath);

    useCase = new ExtractFileMetadataUseCase(
      FastGlobScanner,
      new NeDBCheckpoint(dbConfig.checkpointDB),
      [exif],
      new NeDBFileMetadataRepository(dbConfig.fileMetadataDB),
    );

    checkpointHelper = new CheckpointDatastoreHelper(dbConfig.checkpointDB);
    fileMetadataHelper = new FileMetadataDatastoreHelper(
      dbConfig.fileMetadataDB,
    );

    await createFileStructure(tempDir, fileStructure);

    const photo1 = path.join(tempDir, 'images/photo1.jpg');
    const photo2 = path.join(tempDir, 'images/photo2.jpg');
    const photo3 = path.join(tempDir, 'images/photo3.jpg');

    writeBase64ImageToFile(base64Image, photo1);
    writeBase64ImageToFile(base64Image, photo2);
    writeBase64ImageToFile(base64Image, photo3);

    await writeExifData(photo1, {
      Make: 'Canon',
      Model: 'EOS 80D',
      GPSLatitude: 48.8566,
      GPSLongitude: 2.3522,
    })();

    await writeExifData(photo2, {
      Make: 'Nikon',
      Model: 'D3500',
      DateTimeOriginal: dateTimeOriginal,
    })();

    const checkpointEntity: CheckpointEntity = {
      _id: 'checkpoint-1',
      category: 'DIR',
      lastUpdate: new Date(),
      source: tempDir,
      processed: [],
    };

    await checkpointHelper.saveOrUpdate(checkpointEntity, {
      _id: 'checkpoint-1',
    })();
  });

  afterAll(async () => {
    await deleteFileOrDirectory(tempDir);
  });

  const validateEntity = (
    entity: FileMetadataEntity,
    name: string,
    fullPath: string,
    extension: string,
  ) => {
    expect(entity._id).toBe(fullPath);
    expect(entity.name).toBe(name);
    expect(entity.fullPath).toBe(fullPath);
    expect(entity.extension).toBe(extension);
  };

  const validateExif = (entity: any, exifData: any) => {
    Object.entries(exifData).forEach(([key, value]) => {
      expect(entity.exif[key]).toEqual(value);
    });
  };

  it('should iterate, extract and save metadata from directory', async () => {
    const command = {
      rootDirectory: tempDir,
      extensions: ['JPG'],
      batchSize: 2,
      idCheckpoint: 'checkpoint-1',
      progress: () => {},
    };

    const result = await useCase.extractFileMetadata(command)();

    expectRight(result, (batches) => {
      expect(batches).toBeDefined();
      expect(batches.length).toBe(2);
      expect(batches![0]!.length).toBe(2);
      expect(batches![1]!.length).toBe(1);
    });

    const checkpointData = await checkpointHelper.find({
      _id: 'checkpoint-1',
    })();
    expectRight(checkpointData, (checkpointEntities) => {
      expect(checkpointEntities.length).toBe(1);

      const processed = checkpointEntities![0]!.processed;
      expect(processed).toEqual(
        expect.arrayContaining([
          path.join(tempDir, 'images/photo1.jpg'),
          path.join(tempDir, 'images/photo2.jpg'),
          path.join(tempDir, 'images/photo3.jpg'),
        ]),
      );
    });

    const fileMetadataEntities = await fileMetadataHelper.find({})();

    expectRight(fileMetadataEntities, (entities) => {
      expect(entities).toHaveLength(3);

      const photo1 = entities.find(
        (fileMetadataEntity) => fileMetadataEntity.name === 'photo1',
      );
      validateEntity(
        photo1!,
        'photo1',
        path.join(tempDir, 'images/photo1.jpg'),
        '.jpg',
      );
      validateExif(photo1, {
        Make: 'Canon',
        Model: 'EOS 80D',
        GPSLatitude: 48.8566,
        GPSLongitude: 2.3522,
      });

      const photo2 = entities.find(
        (fileMetadataEntity) => fileMetadataEntity.name === 'photo2',
      );
      validateEntity(
        photo2!,
        'photo2',
        path.join(tempDir, 'images/photo2.jpg'),
        '.jpg',
      );
      validateExif(photo2, {
        Make: 'Nikon',
        Model: 'D3500',
        // DateTimeOriginal: dateTimeOriginal,
      });

      const photo3 = entities.find(
        (fileMetadataEntity) => fileMetadataEntity.name === 'photo3',
      );
      validateEntity(
        photo3!,
        'photo3',
        path.join(tempDir, 'images/photo3.jpg'),
        '.jpg',
      );

      expect(photo3!.exif).not.toHaveProperty('GPSLatitude');
      expect(photo3!.exif).not.toHaveProperty('GPSLongitude');
      expect(photo3!.exif).not.toHaveProperty('Make');
      expect(photo3!.exif).not.toHaveProperty('Model');
      expect(photo3!.exif).not.toHaveProperty('DateTimeOriginal');
    });
  });
});
