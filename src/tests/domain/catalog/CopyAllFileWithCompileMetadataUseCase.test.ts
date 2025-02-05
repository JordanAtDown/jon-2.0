import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as path from 'path';
import CompiledMetadataDBHelper from '../../infra/utils/CompiledMetadataDBHelper.js';
import CopyAllFileWithCompileMetadataUseCase from '../../../domain/catalog/usecase/CopyAllFileWithCompileMetadataUseCase.js';
import {
  createFileStructure,
  deleteFileOrDirectory,
  findFiles,
} from '../../shared/utils/test/Filesystem.js';
import {
  base64Image,
  extractExifProperties,
  writeBase64ImageToFile,
} from '../../shared/utils/test/Image.js';
import initializeDB from '../../infra/utils/InitializeDB.js';
import LokiJSMetadataRepository from '../../../infra/catalog/LokiJSMetadataRepository.js';
import LokiJSCheckpoint from '../../../infra/sharedkernel/checkpoint/LokiJSCheckpoint.js';
import {
  expectTaskEitherLeft,
  expectTaskEitherRight,
} from '../../shared/utils/test/Expected.js';
import CheckpointDBHelper from '../../infra/utils/CheckpointDBHelper.js';
import { ExifDateTime } from 'exiftool-vendored';
import { validateCheckpointEntity } from '../../shared/utils/test/Validations.js';

describe('CopyAllFileWithCompileMetadataUseCase', () => {
  const tempDir = path.join(
    __dirname,
    'copy_all_file_with_compile_metadata_usecase',
  );
  let lokiJSMetadataRepository: LokiJSMetadataRepository;
  let lokiJSCheckpoint: LokiJSCheckpoint;
  let helper: CompiledMetadataDBHelper;
  let ckHelper: CheckpointDBHelper;

  beforeAll(async () => {
    const dbPath = path.join(tempDir, 'db');
    const dbConfig = await initializeDB(dbPath);

    await createFileStructure(tempDir, {
      src: {
        'image1.jpg': '',
        'image2.jpg': '',
        'image3.jpg': '',
        'image4.jpg': '',
        'image5.jpg': '',
      },
      dest: {},
    });
    const image1 = path.join(tempDir, 'src', 'image1.jpg');
    const image2 = path.join(tempDir, 'src', 'image2.jpg');
    const image3 = path.join(tempDir, 'src', 'image3.jpg');
    const image4 = path.join(tempDir, 'src', 'image4.jpg');
    const image5 = path.join(tempDir, 'src', 'image5.jpg');
    const alreadyMove = path.join(tempDir, 'src', 'image6.jpg');
    writeBase64ImageToFile(base64Image, image1);
    writeBase64ImageToFile(base64Image, image2);
    writeBase64ImageToFile(base64Image, image3);
    writeBase64ImageToFile(base64Image, image4);
    writeBase64ImageToFile(base64Image, image5);

    lokiJSMetadataRepository = new LokiJSMetadataRepository(
      dbConfig.compiledMetadataDB,
    );
    lokiJSCheckpoint = new LokiJSCheckpoint(dbConfig.checkpointDB);
    helper = new CompiledMetadataDBHelper(dbConfig.compiledMetadataDB);
    ckHelper = new CheckpointDBHelper(dbConfig.checkpointDB);

    const taskEitherAddAll = helper.addAll([
      // 2018/05/IMAGE_2018_05_15-10_00_00.jpg
      {
        _id: image1,
        fullPath: image1,
        tags: ['tag1', 'tag2'],
        year: 2018,
        month: 5,
        type: 'IMAGE',
        hasExif: true,
        extension: '.jpg',
        date: {
          extraite: undefined,
          dateTimeOriginal: '2018-05-15T10:00:00',
          dateDictionnaire: undefined,
        },
      },
      // 2014/05/IMAGE_2014_05_15-10_00_00.jpg
      {
        _id: image2,
        fullPath: image2,
        tags: ['mer', 'voiture'],
        year: 2014,
        month: 5,
        type: 'IMAGE',
        hasExif: false,
        extension: '.jpg',
        date: {
          extraite: '2014-05-15T10:00:00',
          dateTimeOriginal: undefined,
          dateDictionnaire: undefined,
        },
      },
      // 2023/05/IMAGE_2023_05_15-10_00_00.jpg
      {
        _id: image3,
        fullPath: image3,
        tags: ['tag1', 'tag2'],
        year: 2023,
        month: 5,
        type: 'IMAGE',
        hasExif: true,
        extension: '.jpg',
        date: {
          extraite: undefined,
          dateTimeOriginal: '2023-05-15T10:00:00',
          dateDictionnaire: undefined,
        },
      },
      // 2009/05/IMAGE_2009_05_15-10_00_00.jpg
      {
        _id: image4,
        fullPath: image4,
        tags: [],
        year: 2009,
        month: 5,
        type: 'IMAGE',
        hasExif: false,
        extension: '.jpg',
        date: {
          extraite: '2009-05-15T10:00:00',
          dateTimeOriginal: undefined,
          dateDictionnaire: undefined,
        },
      },
      // 2010/05/IMAGE_2010_05_15-10_00_00.jpg
      {
        _id: image5,
        fullPath: image5,
        tags: ['lego', 'enfant', 'voyages'],
        year: 2010,
        month: 5,
        type: 'IMAGE',
        hasExif: true,
        extension: '.jpg',
        date: {
          extraite: '2023-05-15T10:00:00',
          dateTimeOriginal: '2010-05-15T10:00:00',
          dateDictionnaire: '2023-05-15T10:00:00',
        },
      },
      {
        _id: alreadyMove,
        fullPath: alreadyMove,
        tags: [],
        year: 2012,
        month: 5,
        type: 'IMAGE',
        hasExif: true,
        extension: '.jpg',
        date: {
          extraite: undefined,
          dateTimeOriginal: '2012-05-15T10:00:00',
          dateDictionnaire: undefined,
        },
      },
    ]);
    await expectTaskEitherRight(taskEitherAddAll, (_) => {});

    const taskEitherAdd = ckHelper.add({
      _id: 'checkpoint-1',
      category: 'ID',
      lastUpdate: '2023-11-01T10:00:00',
      processed: [alreadyMove],
      source: 'CompiledMetadata',
    });
    await expectTaskEitherRight(taskEitherAdd, (_) => {});
  });

  afterAll(async () => {
    await deleteFileOrDirectory(tempDir);
  });

  it('should copy all files based on compiled metadata', async () => {
    // GIVEN
    const destinationDir = path.join(tempDir, 'dest');
    const srcDir = path.join(tempDir, 'src');
    const command = {
      destinationDir: destinationDir,
      idCheckpoint: 'checkpoint-1',
      batchSize: 2,
      itemCallback: () => {},
      progressCallback: () => {},
    };
    const usecase = new CopyAllFileWithCompileMetadataUseCase(
      lokiJSMetadataRepository,
      lokiJSCheckpoint,
    );

    // WHEN
    const taskEither = usecase.copyAllFiles(command);

    // THEN
    await expectTaskEitherRight(taskEither, (_) => {});

    //// Check Checkpoint
    const taskEitherFind = lokiJSCheckpoint.find({});
    await expectTaskEitherRight(taskEitherFind, (checkpoints) => {
      expect(checkpoints).toHaveLength(6);

      validateCheckpointEntity(checkpoints[0]!, {
        id: 'checkpoint-1',
        category: 'ID',
        source: 'CompiledMetadata',
        processed: [path.join(tempDir, 'src', 'image6.jpg')],
      });
      validateCheckpointEntity(checkpoints[1]!, {
        id: 'checkpoint-1',
        category: 'ID',
        source: 'CompiledMetadata',
        processed: [path.join(tempDir, 'src', 'image1.jpg')],
      });
      validateCheckpointEntity(checkpoints[2]!, {
        id: 'checkpoint-1',
        category: 'ID',
        source: 'CompiledMetadata',
        processed: [path.join(tempDir, 'src', 'image3.jpg')],
      });
      validateCheckpointEntity(checkpoints[3]!, {
        id: 'checkpoint-1',
        category: 'ID',
        source: 'CompiledMetadata',
        processed: [path.join(tempDir, 'src', 'image5.jpg')],
      });
      validateCheckpointEntity(checkpoints[4]!, {
        id: 'checkpoint-1',
        category: 'ID',
        source: 'CompiledMetadata',
        processed: [path.join(tempDir, 'src', 'image2.jpg')],
      });
      validateCheckpointEntity(checkpoints[5]!, {
        id: 'checkpoint-1',
        category: 'ID',
        source: 'CompiledMetadata',
        processed: [path.join(tempDir, 'src', 'image4.jpg')],
      });
    });

    //// Check destination directory
    const expectedFiles = [
      path.join(destinationDir, '2009', '05', 'IMAGE_2009_05_15-10_00_00.jpg'),
      path.join(destinationDir, '2010', '05', 'IMAGE_2010_05_15-10_00_00.jpg'),
      path.join(destinationDir, '2014', '05', 'IMAGE_2014_05_15-10_00_00.jpg'),
      path.join(destinationDir, '2018', '05', 'IMAGE_2018_05_15-10_00_00.jpg'),
      path.join(destinationDir, '2023', '05', 'IMAGE_2023_05_15-10_00_00.jpg'),
    ];
    const movedFiles = await findFiles(`${destinationDir}/**/*.jpg`);
    expect(movedFiles).toHaveLength(5);
    expect(movedFiles).toEqual(expect.arrayContaining(expectedFiles));

    //// Check EXIF properties on files
    const extract01 = extractExifProperties(
      '/home/personnel/developpements/jon-2.0/src/tests/domain/catalog/copy_all_file_with_compile_metadata_usecase/dest/2018/05/IMAGE_2018_05_15-10_00_00.jpg',
      ['Keywords', 'DateTimeOriginal'],
    );
    const tag01: string[] = ['tag1', 'tag2'];
    await expectTaskEitherRight(extract01, (exifData) => {
      expect(exifData['Keywords']).toEqual(expect.arrayContaining(tag01));
      expect(exifData['DateTimeOriginal']).instanceOf(ExifDateTime);
      expect((exifData['DateTimeOriginal'] as ExifDateTime).toISOString()).toBe(
        '2018-05-15T10:00:00',
      );
    });

    const extract02 = extractExifProperties(
      '/home/personnel/developpements/jon-2.0/src/tests/domain/catalog/copy_all_file_with_compile_metadata_usecase/dest/2014/05/IMAGE_2014_05_15-10_00_00.jpg',
      ['Keywords', 'DateTimeOriginal'],
    );
    const tag02: string[] = ['mer', 'voiture'];
    await expectTaskEitherRight(extract02, (exifData) => {
      expect(exifData['Keywords']).toEqual(expect.arrayContaining(tag02));
      expect(exifData['DateTimeOriginal']).instanceOf(ExifDateTime);
      expect((exifData['DateTimeOriginal'] as ExifDateTime).toISOString()).toBe(
        '2014-05-15T10:00:00',
      );
    });

    const extract03 = extractExifProperties(
      '/home/personnel/developpements/jon-2.0/src/tests/domain/catalog/copy_all_file_with_compile_metadata_usecase/dest/2010/05/IMAGE_2010_05_15-10_00_00.jpg',
      ['Keywords', 'DateTimeOriginal'],
    );
    const tag03: string[] = ['lego', 'enfant', 'voyages'];
    await expectTaskEitherRight(extract03, (exifData) => {
      expect(exifData['Keywords']).toEqual(expect.arrayContaining(tag03));
      expect(exifData['DateTimeOriginal']).instanceOf(ExifDateTime);
      expect((exifData['DateTimeOriginal'] as ExifDateTime).toISOString()).toBe(
        '2010-05-15T10:00:00',
      );
    });

    const extract04 = extractExifProperties(
      '/home/personnel/developpements/jon-2.0/src/tests/domain/catalog/copy_all_file_with_compile_metadata_usecase/dest/2009/05/IMAGE_2009_05_15-10_00_00.jpg',
      ['Keywords', 'DateTimeOriginal'],
    );
    await expectTaskEitherRight(extract04, (exifData) => {
      expect(exifData['Keywords']).toEqual(undefined);
      expect(exifData['DateTimeOriginal']).instanceOf(ExifDateTime);
      expect((exifData['DateTimeOriginal'] as ExifDateTime).toISOString()).toBe(
        '2009-05-15T10:00:00',
      );
    });

    const extract05 = extractExifProperties(
      '/home/personnel/developpements/jon-2.0/src/tests/domain/catalog/copy_all_file_with_compile_metadata_usecase/dest/2023/05/IMAGE_2023_05_15-10_00_00.jpg',
      ['Keywords', 'DateTimeOriginal'],
    );
    const tag05: string[] = ['tag1', 'tag2'];
    await expectTaskEitherRight(extract05, (exifData) => {
      expect(exifData['Keywords']).toEqual(expect.arrayContaining(tag05));
      expect(exifData['DateTimeOriginal']).instanceOf(ExifDateTime);
      expect((exifData['DateTimeOriginal'] as ExifDateTime).toISOString()).toBe(
        '2023-05-15T10:00:00',
      );
    });

    //// Check original files are remove
    const notExpectedFiles = [
      path.join(tempDir, 'src', 'image1.jpg'),
      path.join(tempDir, 'src', 'image2.jpg'),
      path.join(tempDir, 'src', 'image3.jpg'),
      path.join(tempDir, 'src', 'image4.jpg'),
      path.join(tempDir, 'src', 'image5.jpg'),
    ];
    const notIn = await findFiles(`${srcDir}/**/*.jpg`);
    expect(notIn).toHaveLength(0);
    expect(notIn).not.equals(expect.arrayContaining(notExpectedFiles));
  });
});
