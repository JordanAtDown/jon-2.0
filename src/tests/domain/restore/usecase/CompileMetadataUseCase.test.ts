import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as path from 'path';
import CompileMetadataUseCase from '../../../../domain/restore/usecase/CompileMetadataUseCase.js';
import CheckpointDBHelper from '../../../infra/utils/CheckpointDBHelper.js';
import CompiledMetadataDBHelper from '../../../infra/utils/CompiledMetadataDBHelper.js';
import FileMetadataDBHelper from '../../../infra/utils/FileMetadataDDBHelper.js';
import initializeDB from '../../../infra/utils/InitializeDB.js';
import LokiJSCheckpoint from 'infra/sharedkernel/checkpoint/LokiJSCheckpoint.js';
import LokiJSFileMetadataRepository from '../../../../infra/restore/LokiJSFileMetadataRepository.js';
import LokiJSompiledMetadataRepository from '../../../../infra/restore/LokiJSompiledMetadataRepository.js';
import HashTagGenerator from 'infra/shared/tag/HashTagGenerator.js';
import HashDateGenerator from '../../../../infra/shared/tag/HashDateGenerator.js';
import { deleteFileOrDirectory } from '../../../shared/utils/test/Filesystem.js';
import { CompileMetadataUseCaseCommand } from '../../../../domain/restore/usecase/CompileMetadataUseCaseCommand.js';
import {
  expectRight,
  expectTaskEitherRight,
} from '../../../shared/utils/test/Expected.js';
import { DateTime } from 'luxon';
import { validateCheckpointEntity } from '../../../shared/utils/test/Validations.js';

describe('CompileMetadataUseCase', () => {
  const tempDir = path.join(__dirname, 'compile_metadata_usecase');
  let dbPath: string;
  let usecase: CompileMetadataUseCase;
  let ckHelper: CheckpointDBHelper;
  let fmHelper: FileMetadataDBHelper;
  let cmHelper: CompiledMetadataDBHelper;

  const tagDictionary: Record<string, string> = {
    images: 'photo',
    documents: 'docs',
  };

  const dateDictionary: Record<string, string> = {
    image1: '2023-01-15',
    image2: '2023-02-10',
    image4: '2018-02-10',
    doc1: '2023-03-05',
  };

  beforeAll(async () => {
    dbPath = path.join(tempDir, 'db');
    const dbConfig = await initializeDB(dbPath);

    const checkpointRepository = new LokiJSCheckpoint(dbConfig.checkpointDB);
    const fileMetadataRepository = new LokiJSFileMetadataRepository(
      dbConfig.fileMetadataDB,
    );
    const compiledMetadataRepository = new LokiJSompiledMetadataRepository(
      dbConfig.compiledMetadataDB,
    );
    const tagsGenerator = new HashTagGenerator(tagDictionary);
    const dateGenerator = new HashDateGenerator(dateDictionary);

    usecase = new CompileMetadataUseCase(
      fileMetadataRepository,
      compiledMetadataRepository,
      checkpointRepository,
      tagsGenerator,
      dateGenerator,
    );

    ckHelper = new CheckpointDBHelper(dbConfig.checkpointDB);
    fmHelper = new FileMetadataDBHelper(dbConfig.fileMetadataDB);
    cmHelper = new CompiledMetadataDBHelper(dbConfig.compiledMetadataDB);

    // Date name format
    const taskEitherAdd01 = fmHelper.add({
      _id: path.join(tempDir, 'images/IMG_20180719_205840_01.jpg'),
      filename: 'IMG_20180719_205840_01.jpg',
      fullPath: path.join(tempDir, 'images/IMG_20180719_205840_01.jpg'),
      directory: path.join(tempDir, 'images'),
      name: 'IMG_20180719_205840_01',
      extension: '.jpg',
      type: 'images',
    });
    await expectTaskEitherRight(taskEitherAdd01, () => {});

    // DateTimeOriginal
    const taskEitherAdd02 = fmHelper.add({
      _id: path.join(tempDir, 'images/image2.jpg'),
      filename: 'image2.jpg',
      fullPath: path.join(tempDir, 'images/image2.jpg'),
      directory: path.join(tempDir, 'images'),
      name: 'image2',
      extension: '.jpg',
      type: 'images',
      exif: {
        dateTimeOriginal: DateTime.fromISO('2023-03-14T10:00:00').toString(),
      },
    });
    await expectTaskEitherRight(taskEitherAdd02, () => {});

    // Date dictionary format
    const taskEitherAdd03 = fmHelper.add({
      _id: path.join(tempDir, 'images/image4.jpg'),
      filename: 'image4.jpg',
      fullPath: path.join(tempDir, 'images/image4.jpg'),
      directory: path.join(tempDir, 'images'),
      name: 'image4',
      extension: '.jpg',
      type: 'images',
    });
    await expectTaskEitherRight(taskEitherAdd03, () => {});

    // Saved in checkpoint
    const taskEitherAdd04 = fmHelper.add({
      _id: path.join(tempDir, 'images/image1.jpg'),
      filename: 'image1.jpg',
      fullPath: path.join(tempDir, 'images/image1.jpg'),
      directory: path.join(tempDir, 'images'),
      name: 'image1',
      extension: '.jpg',
      type: 'images',
    });
    await expectTaskEitherRight(taskEitherAdd04, () => {});

    const taskEitherAdd = ckHelper.add({
      _id: 'checkpoint-1',
      category: 'ID',
      lastUpdate: '20',
      source: 'Filemetadata',
      processed: [path.join(tempDir, 'images/image1.jpg')],
    });
    await expectTaskEitherRight(taskEitherAdd, () => {});
  });

  afterAll(async () => {
    await deleteFileOrDirectory(tempDir);
  });

  it('should successfully compile metadata', async () => {
    // GIVEN
    const command: CompileMetadataUseCaseCommand = {
      idCheckpoint: 'checkpoint-1',
      batchSize: 2,
      progressCallback: () => {},
      itemCallback: () => {},
    };

    // WHEN
    await usecase.compile(command)();

    // THEN
    //// Check checkpoint
    const checkpointData = await ckHelper.find({})();
    expectRight(checkpointData, (checkpoints) => {
      expect(checkpoints).toHaveLength(3);
      validateCheckpointEntity(checkpoints[0]!, {
        id: 'checkpoint-1',
        category: 'ID',
        source: 'Filemetadata',
        processed: [path.join(tempDir, 'images/image1.jpg')],
      });
      validateCheckpointEntity(checkpoints[1]!, {
        id: 'checkpoint-1',
        category: 'ID',
        source: 'Filemetadata',
        processed: [
          path.join(tempDir, 'images/IMG_20180719_205840_01.jpg'),
          path.join(tempDir, 'images/image2.jpg'),
        ],
      });
      validateCheckpointEntity(checkpoints[2]!, {
        id: 'checkpoint-1',
        category: 'ID',
        source: 'Filemetadata',
        processed: [path.join(tempDir, 'images/image4.jpg')],
      });
    });

    //// Check compiled metadata created
    const compiledData = await cmHelper.find({})();
    expectRight(compiledData, (metadata) => {
      expect(metadata).toHaveLength(3);

      // Date name format
      expect(metadata[0]!._id).toEqual(
        path.join(tempDir, 'images/IMG_20180719_205840_01.jpg'),
      );
      expect(metadata[0]!.fullPath).toEqual(
        path.join(tempDir, 'images/IMG_20180719_205840_01.jpg'),
      );
      expect(metadata[0]!.tags).toEqual(expect.arrayContaining(['photo']));
      expect(metadata[0]!.year).toEqual(2018);
      expect(metadata[0]!.month).toEqual(7);
      expect(metadata[0]!.hasExif).toBeFalsy;
      expect(metadata[0]!.extension).toEqual('.jpg');
      expect(metadata[0]!.type).toEqual('images');
      expect(metadata[0]!.date.extraite).toEqual(
        '2018-07-19T20:58:40.000+02:00',
      );
      expect(metadata[0]!.date.dateTimeOriginal).toEqual(undefined);
      expect(metadata[0]!.date.dateDictionnaire).toEqual(undefined);

      // DateTimeOriginal
      expect(metadata[1]!._id).toEqual(path.join(tempDir, 'images/image2.jpg'));
      expect(metadata[1]!.fullPath).toEqual(
        path.join(tempDir, 'images/image2.jpg'),
      );
      expect(metadata[1]!.tags).toEqual(expect.arrayContaining(['photo']));
      expect(metadata[1]!.year).toEqual(2023);
      expect(metadata[1]!.month).toEqual(3);
      expect(metadata[1]!.hasExif).toBeTruthy;
      expect(metadata[1]!.extension).toEqual('.jpg');
      expect(metadata[1]!.type).toEqual('images');
      expect(metadata[1]!.date.extraite).toEqual(undefined);
      expect(metadata[1]!.date.dateTimeOriginal).toEqual(
        '2023-03-14T10:00:00.000+01:00',
      );
      expect(metadata[1]!.date.dateDictionnaire).toEqual(
        '2023-02-10T00:00:00.000+01:00',
      );

      // Date dictionary format
      expect(metadata[2]!._id).toEqual(path.join(tempDir, 'images/image4.jpg'));
      expect(metadata[2]!.fullPath).toEqual(
        path.join(tempDir, 'images/image4.jpg'),
      );
      expect(metadata[2]!.tags).toEqual(expect.arrayContaining(['photo']));
      expect(metadata[2]!.year).toEqual(2018);
      expect(metadata[2]!.month).toEqual(2);
      expect(metadata[2]!.hasExif).toBeTruthy;
      expect(metadata[2]!.extension).toEqual('.jpg');
      expect(metadata[2]!.type).toEqual('images');
      expect(metadata[2]!.date.extraite).toEqual(undefined);
      expect(metadata[2]!.date.dateTimeOriginal).toEqual(undefined);
      expect(metadata[2]!.date.dateDictionnaire).toEqual(
        '2018-02-10T00:00:00.000+01:00',
      );
    });
  });
});
