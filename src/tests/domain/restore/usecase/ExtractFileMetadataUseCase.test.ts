import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as path from 'path';
import ExtractFileMetadataUseCase from '../../../../domain/restore/usecase/ExtractFileMetadataUseCase.js';
import CheckpointDBHelper from '../../../infra/utils/CheckpointDBHelper.js';
import FileMetadataDBHelper from '../../../infra/utils/FileMetadataDDBHelper.js';
import {
  createFileStructure,
  deleteFileOrDirectory,
  FileStructure,
} from '../../../shared/utils/test/Filesystem.js';
import { ExifDateTime } from 'exiftool-vendored';
import LokiJSFileMetadataRepository from '../../../../infra/restore/LokiJSFileMetadataRepository.js';
import {
  base64Image,
  writeBase64ImageToFile,
  writeExifData,
} from '../../../shared/utils/test/Image.js';
import { FileMetadataEntity } from '../../../../infra/restore/FileMetadataEntity.js';
import { expectRight } from '../../../shared/utils/test/Expected.js';
import { validateCheckpointEntity } from '../../../shared/utils/test/Validations.js';
import initializeDB from '../../../infra/utils/InitializeDB';
import FastGlobScanner from '../../../../infra/shared/filesystem/FastGlobScanner';
import { LokiJSCheckpoint } from '../../../../index';
import exif from '../../../../domain/shared/extractor/Exif';

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
  let checkpointHelper: CheckpointDBHelper;
  let fileMetadataHelper: FileMetadataDBHelper;
  let dbPath: string;

  const dateTimeOriginal = ExifDateTime.fromEXIF(
    '2021:05:20 14:30:00',
    'Europe/Paris',
  );
  beforeAll(async () => {
    dbPath = path.join(tempDir, 'db');
    const dbConfig = await initializeDB(dbPath);

    useCase = new ExtractFileMetadataUseCase(
      FastGlobScanner,
      new LokiJSCheckpoint(dbConfig.checkpointDB),
      [exif],
      new LokiJSFileMetadataRepository(dbConfig.fileMetadataDB),
    );

    checkpointHelper = new CheckpointDBHelper(dbConfig.checkpointDB);
    fileMetadataHelper = new FileMetadataDBHelper(dbConfig.fileMetadataDB);

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
    // GIVEN
    const command = {
      rootDirectory: tempDir,
      extensions: ['JPG'],
      batchSize: 2,
      idCheckpoint: 'checkpoint-1',
      progress: () => {},
      itemCallback: () => {},
    };

    // WHEN
    await useCase.extractFileMetadata(command)();

    // THEN
    //// Check checkpoint
    const checkpointData = await checkpointHelper.find({
      _id: 'checkpoint-1',
    })();
    expectRight(checkpointData, (checkpointEntities) => {
      expect(checkpointEntities.length).toBe(2);

      validateCheckpointEntity(checkpointEntities[0]!, {
        id: 'checkpoint-1',
        category: 'DIR',
        source: tempDir,
        processed: [
          path.join(tempDir, 'images/photo1.jpg'),
          path.join(tempDir, 'images/photo2.jpg'),
        ],
      });
      validateCheckpointEntity(checkpointEntities[1]!, {
        id: 'checkpoint-1',
        category: 'DIR',
        source: tempDir,
        processed: [path.join(tempDir, 'images/photo3.jpg')],
      });
    });

    //// Check Filemetadata created
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
