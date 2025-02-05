import { describe, it, beforeAll, afterAll, expect, afterEach } from 'vitest';
import path from 'path';
import LokiJSMetadataRepository from '../../../infra/catalog/LokiJSMetadataRepository.js';
import CompiledMetadataDBHelper from '../utils/CompiledMetadataDBHelper.js';
import initializeDB from '../utils/InitializeDB.js';
import { deleteFileOrDirectory } from '../../shared/utils/test/Filesystem.js';
import { CompileMetadataEntity } from '../../../infra/sharedkernel/CompileMetadataEntity.js';
import { expectRight } from '../../shared/utils/test/Expected.js';
import YearMonth from '../../../domain/sharedkernel/metadata/YearMonth.js';

describe('LokiJSMetadataRepository', () => {
  const tempDir = path.join(__dirname, 'lokijsmetadatarepository');
  let repository: LokiJSMetadataRepository;
  let helper: CompiledMetadataDBHelper;

  beforeAll(async () => {
    const dbConfig = await initializeDB(tempDir);
    repository = new LokiJSMetadataRepository(dbConfig.compiledMetadataDB);
    helper = new CompiledMetadataDBHelper(dbConfig.compiledMetadataDB);
  });

  afterEach(async () => {
    await helper.delete({})();
  });

  afterAll(async () => {
    await deleteFileOrDirectory(tempDir);
  });

  it('should retrieve all unique YearMonth combinations', async () => {
    const entities: CompileMetadataEntity[] = [
      {
        _id: '/path1.jpg',
        fullPath: '/path1.jpg',
        tags: ['tag1', 'tag2'],
        year: 2023,
        month: 10,
        hasExif: true,
        extension: '.jpg',
        type: 'image',
        date: {
          extraite: '2023-10-01T12:34:56.000Z',
          dateTimeOriginal: '2023-10-01T12:34:56.000Z',
          dateDictionnaire: undefined,
        },
      },
      {
        _id: '/path2.jpg',
        fullPath: '/path2.jpg',
        tags: ['tag3', 'tag4'],
        year: 2023,
        month: 10,
        hasExif: false,
        extension: '.jpg',
        type: 'image',
        date: {
          extraite: undefined,
          dateTimeOriginal: '2023-10-15T08:00:00.000Z',
          dateDictionnaire: '2023-10-01T00:00:00.000Z',
        },
      },
      {
        _id: '/path3.jpg',
        fullPath: '/path3.jpg',
        tags: ['tag5'],
        year: 2022,
        month: 12,
        hasExif: true,
        extension: '.jpg',
        type: 'image',
        date: {
          extraite: '2022-12-10T14:20:00.000Z',
          dateTimeOriginal: undefined,
          dateDictionnaire: undefined,
        },
      },
    ];
    await helper.addAll(entities)();

    const result = await repository.getAllUniqueYearsMonths()();

    expectRight(result, (uniqueYearMonths) => {
      expect(uniqueYearMonths).toHaveLength(2);
      expect(uniqueYearMonths).toEqual(
        expect.arrayContaining([
          { year: 2023, month: 10 },
          { year: 2022, month: 12 },
        ]),
      );
    });
  });

  it('should find metadata by a specific YearMonth', async () => {
    const entities: CompileMetadataEntity[] = [
      {
        _id: '/path1.jpg',
        fullPath: '/path1.jpg',
        tags: ['tag1', 'tag2'],
        year: 2023,
        month: 10,
        hasExif: true,
        extension: '.jpg',
        type: 'image',
        date: {
          extraite: '2023-10-01T12:34:56.000Z',
          dateTimeOriginal: '2023-10-01T12:34:56.000Z',
          dateDictionnaire: undefined,
        },
      },
      {
        _id: '/path2.jpg',
        fullPath: '/path2.jpg',
        tags: ['tag3', 'tag4'],
        year: 2023,
        month: 10,
        hasExif: false,
        extension: '.jpg',
        type: 'image',
        date: {
          extraite: undefined,
          dateTimeOriginal: '2023-10-15T08:00:00.000Z',
          dateDictionnaire: '2023-10-01T00:00:00.000Z',
        },
      },
      {
        _id: '/path3.jpg',
        fullPath: '/path3.jpg',
        tags: ['tag5'],
        year: 2022,
        month: 12,
        hasExif: true,
        extension: '.jpg',
        type: 'image',
        date: {
          extraite: '2022-12-10T14:20:00.000Z',
          dateTimeOriginal: undefined,
          dateDictionnaire: undefined,
        },
      },
    ];
    await helper.addAll(entities)();

    const yearMonth: YearMonth = { year: 2023, month: 10 };
    const result = await repository.findByYearMonth(yearMonth)();

    expectRight(result, (metadatas) => {
      expect(metadatas).toHaveLength(2);
    });
  });

  it('should return an empty array if no metadata matches the YearMonth', async () => {
    const entities: CompileMetadataEntity[] = [
      {
        _id: '/path1.jpg',
        fullPath: '/path1.jpg',
        tags: ['tag1', 'tag2'],
        year: 2023,
        month: 10,
        hasExif: true,
        extension: '.jpg',
        type: 'image',
        date: {
          extraite: '2023-10-01T12:34:56.000Z',
          dateTimeOriginal: '2023-10-01T12:34:56.000Z',
          dateDictionnaire: undefined,
        },
      },
      {
        _id: '/path2.jpg',
        fullPath: '/path2.jpg',
        tags: ['tag3', 'tag4'],
        year: 2023,
        month: 10,
        hasExif: false,
        extension: '.jpg',
        type: 'image',
        date: {
          extraite: undefined,
          dateTimeOriginal: '2023-10-15T08:00:00.000Z',
          dateDictionnaire: '2023-10-01T00:00:00.000Z',
        },
      },
    ];
    helper.addAll(entities);

    const yearMonth: YearMonth = { year: 2020, month: 1 };
    const result = await repository.findByYearMonth(yearMonth)();

    expectRight(result, (metadatas) => {
      expect(metadatas).toHaveLength(0);
    });
  });
});
