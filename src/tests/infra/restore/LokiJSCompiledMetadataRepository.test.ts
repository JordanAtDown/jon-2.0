import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'path';
import LokiJSompiledMetadataRepository from '../../../infra/restore/LokiJSompiledMetadataRepository.js';
import CompiledMetadataDBHelper from '../utils/CompiledMetadataDBHelper.js';
import initializeDB from '../utils/InitializeDB.js';
import { deleteFileOrDirectory } from '../../shared/utils/test/Filesystem.js';
import CompiledMetadata from '../../../domain/sharedkernel/metadata/CompiledMetadata.js';
import CompiledDate from '../../../domain/sharedkernel/metadata/CompiledDate.js';
import { expectTaskEitherRight } from '../../shared/utils/test/Expected.js';

describe('LokiJSCompiledMetadataRepository', () => {
  const tempDir = path.join(__dirname, 'lokijscompiledmetadatarepository');
  let repository: LokiJSompiledMetadataRepository;
  let helper: CompiledMetadataDBHelper;

  beforeAll(async () => {
    const dbConfig = await initializeDB(tempDir);
    const compiledMetadataDB: Loki = dbConfig.compiledMetadataDB;
    repository = new LokiJSompiledMetadataRepository(compiledMetadataDB);
    helper = new CompiledMetadataDBHelper(compiledMetadataDB);
  });

  afterAll(async () => {
    await deleteFileOrDirectory(tempDir);
  });

  it('should successfully save compiledMetadata', async () => {
    const metadata = new CompiledMetadata(
      '/insert/test/path.jpg',
      new Set(['landscape', 'nature']),
      2023,
      10,
      true,
      new CompiledDate(),
      '.jpg',
      'IMAGE',
    );

    await repository.save(metadata)();

    const result = helper.find({ _id: metadata.fullPath });
    await expectTaskEitherRight(result, (savedMetadata) => {
      const compileMetadataEntity = savedMetadata[0]!;
      expect(compileMetadataEntity._id).toBe(metadata.fullPath);
      expect(compileMetadataEntity.fullPath).toBe(metadata.fullPath);
      expect(compileMetadataEntity.year).toBe(metadata.year);
      expect(compileMetadataEntity.month).toBe(metadata.month);
      expect(compileMetadataEntity.date).toMatchObject({
        dateDictionnaire: undefined,
        dateTimeOriginal: undefined,
        extraite: undefined,
      });
    });
  });
});
