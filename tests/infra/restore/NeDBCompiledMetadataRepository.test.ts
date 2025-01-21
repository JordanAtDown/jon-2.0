import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import initializeDatabase from '../../../src/infra/shared/utils/InitializeDatabase';
import { deleteFileOrDirectory } from '../../../src/domain/shared/utils/test/Filesystem';
import CompiledMetadataDatastoreHelper from '../../../src/infra/shared/utils/CompiledMetadataDatastoreHelper';
import { expectRight } from '../../../src/domain/shared/utils/test/Expected';
import NeDBCompiledMetadataRepository from '../../../src/infra/restore/NeDBCompiledMetadataRepository';

describe('NeDBCompiledMetadataRepository', () => {
  const testDbPath = './temp/NeDBCompiledMetadataRepository/';
  let repository: NeDBCompiledMetadataRepository;
  let helper: CompiledMetadataDatastoreHelper;

  beforeAll(async () => {
    const dbConfig = await initializeDatabase(testDbPath);
    const compiledMetadataDB = dbConfig.compiledMetadataDB;
    repository = new NeDBCompiledMetadataRepository(compiledMetadataDB);
    helper = new CompiledMetadataDatastoreHelper(compiledMetadataDB);
  });

  afterAll(async () => {
    await deleteFileOrDirectory(testDbPath);
  });

  it('should successfully insert metadata', async () => {
    const entity = helper.createCompileMetadataEntity({
      _id: '/insert/test/path.jpg',
      fullPath: '/insert/test/path.jpg',
      tags: ['landscape', 'nature'],
      destinationFolder: '/2023/10',
      year: 2023,
      month: 10,
      hasExif: true,
      newName: 'photo.jpg',
    });

    const taskEither = await repository.save(entity)();
    expectRight(taskEither, (compileMetadata) => {
      expect(compileMetadata).toBeDefined();
    });

    const result = await helper.find({ _id: entity._id })();
    expectRight(result, (compileMetadataEntity) => {
      expect(Array.isArray(compileMetadataEntity)).toBe(true);
      expect(compileMetadataEntity).toHaveLength(1);
      expect(compileMetadataEntity[0]).toEqual(entity);
    });
  });

  it('should save the same data multiple times without duplicates', async () => {
    const entity = helper.createCompileMetadataEntity({
      _id: '/unique/test/path.jpg',
      fullPath: '/unique/test/path.jpg',
    });

    await repository.save(entity)();
    await repository.save(entity)();

    const result = await helper.find({ _id: entity.fullPath })();
    expectRight(result, (compileMetadataEntity) => {
      expect(Array.isArray(compileMetadataEntity)).toBe(true);
      expect(compileMetadataEntity).toHaveLength(1);
      expect(compileMetadataEntity[0]).toEqual(entity);
    });
  });
});
