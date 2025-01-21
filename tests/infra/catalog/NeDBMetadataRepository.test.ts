import { describe, it, beforeAll, afterAll, expect, afterEach } from 'vitest';
import NeDBMetadataRepository from '../../../src/infra/catalog/NeDBMetadataRepository';
import initializeDatabase from '../../../src/infra/shared/utils/InitializeDatabase';
import { deleteFileOrDirectory } from '../../../src/domain/shared/utils/test/Filesystem';
import { expectRight } from '../../../src/domain/shared/utils/test/Expected';
import CompiledMetadataDatastoreHelper from '../../../src/infra/shared/utils/CompiledMetadataDatastoreHelper';
import YearMonth from '../../../src/domain/catalog/YearMonth';
import { CompileMetadataEntity } from '../../../src/infra/sharedkernel/CompileMetadataEntity';

describe('NeDBMetadataRepository with real data', () => {
  const testDbPath = './temp/NeDBMetadataRepository/';
  let repository: NeDBMetadataRepository;
  let helper: CompiledMetadataDatastoreHelper;

  beforeAll(async () => {
    const dbConfig = await initializeDatabase(testDbPath);
    repository = new NeDBMetadataRepository(dbConfig.compiledMetadataDB);
    helper = new CompiledMetadataDatastoreHelper(dbConfig.compiledMetadataDB);
  });

  afterEach(async () => {
    await helper.delete({})();
  });

  afterAll(async () => {
    await deleteFileOrDirectory(testDbPath);
  });

  it('should retrieve all unique YearMonth combinations', async () => {
    const metadataRecords: CompileMetadataEntity[] = [
      helper.createCompileMetadataEntity({
        _id: '/path1.jpg',
        fullPath: '/path1.jpg',
        year: 2023,
        month: 10,
      }),
      helper.createCompileMetadataEntity({
        _id: '/path2.jpg',
        fullPath: '/path2.jpg',
        year: 2023,
        month: 11,
      }),
      helper.createCompileMetadataEntity({
        _id: '/path3.jpg',
        fullPath: '/path3.jpg',
        year: 2023,
        month: 10,
      }),
      helper.createCompileMetadataEntity({
        _id: '/path4.jpg',
        fullPath: '/path4.jpg',
        year: 2022,
        month: 12,
      }),
    ];

    const taskEither = await helper.insertMany(metadataRecords)();
    expectRight(taskEither, (insertResult) => {
      expect(insertResult).toBeDefined();
    });

    const result = await repository.getAllUniqueYearsMonths()();

    expectRight(result, (uniqueYearMonths) => {
      expect(uniqueYearMonths).toHaveLength(3);
      expect(uniqueYearMonths).toEqual(
        expect.arrayContaining([
          { year: 2023, month: 10 },
          { year: 2023, month: 11 },
          { year: 2022, month: 12 },
        ]),
      );
    });
  });

  it('should find metadata by a specific YearMonth', async () => {
    const entities: CompileMetadataEntity[] = [
      helper.createCompileMetadataEntity({
        _id: '/path1.jpg',
        fullPath: '/path1.jpg',
        year: 2023,
        month: 10,
      }),
      helper.createCompileMetadataEntity({
        _id: '/path2.jpg',
        fullPath: '/path2.jpg',
        year: 2023,
        month: 11,
      }),
      helper.createCompileMetadataEntity({
        _id: '/path3.jpg',
        fullPath: '/path3.jpg',
        year: 2023,
        month: 10,
      }),
    ];
    await helper.insertMany(entities)();

    const yearMonth: YearMonth = { year: 2023, month: 10 };
    const result = await repository.findByYearMonth(yearMonth)();

    expectRight(result, (metadatas) => {
      expect(metadatas).toHaveLength(2);
      expect(metadatas).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fullPath: '/path1.jpg' }),
          expect.objectContaining({ fullPath: '/path3.jpg' }),
        ]),
      );
    });
  });

  it('should return an empty array if no metadata matches the YearMonth', async () => {
    const entities: CompileMetadataEntity[] = [
      helper.createCompileMetadataEntity({
        fullPath: '/path1.jpg',
        year: 2023,
        month: 10,
      }),
    ];

    helper.insertMany(entities);

    const yearMonth: YearMonth = { year: 2020, month: 1 };
    const result = await repository.findByYearMonth(yearMonth)();

    expectRight(result, (metadatas) => {
      expect(metadatas).toHaveLength(0);
    });
  });
});
