import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest';
import CheckpointDatastoreHelper from '../../../../src/infra/shared/utils/CheckpointDatastoreHelper';
import initializeDatabase from '../../../../src/infra/shared/utils/InitializeDatabase';
import { deleteFileOrDirectory } from '../../../../src/domain/shared/utils/test/Filesystem';
import {
  expectLeft,
  expectRight,
  expectSome,
} from '../../../../src/domain/shared/utils/test/Expected';
import NeDBCheckpoint from '../../../../src/infra/shared/checkpoint/NeDBCheckpoint';
import CheckpointEntity from '../../../../src/infra/shared/checkpoint/CheckpointEntity';
import NeDBCheckpoint from '../../../../src/infra/shared/checkpoint/NeDBCheckpoint';

describe('CheckpointManager', () => {
  const testDbPath = './temps/CheckpointManager/';
  let repo: NeDBCheckpoint;
  let helper: CheckpointDatastoreHelper;

  beforeAll(async () => {
    const dbConfig = await initializeDatabase(testDbPath);
    const checkpointDB = dbConfig.checkpointDB;
    repo = new NeDBCheckpoint(checkpointDB);
    helper = new CheckpointDatastoreHelper(checkpointDB);
  });

  afterAll(async () => {
    await deleteFileOrDirectory(testDbPath);
  });

  afterEach(async () => {
    helper.delete({});
  });

  it('should successfully save and retrieve a checkpoint by ID', async () => {
    const checkpointEntity: CheckpointEntity = {
      _id: 'checkpoint-1',
      lastUpdateDate: new Date(),
      processedFiles: ['file1.jpg', 'file2.jpg'],
      path: '/path/to/checkpoint',
    };

    await helper.saveOrUpdate(checkpointEntity, { _id: 'checkpoint-1' })();

    const result = await repo.findBy('checkpoint-1')();
    expectRight(result, (checkpointData) => {
      expectSome(checkpointData, (data) => {
        expect(data).toEqual(
          expect.objectContaining({
            _id: 'checkpoint-1',
            processedFiles: expect.arrayContaining(['file1.jpg', 'file2.jpg']),
          }),
        );
      });
    });
  });

  it('should update an existing checkpoint', async () => {
    const newFiles = new Set(['new-file.jpg']);

    const checkpointEntity: CheckpointEntity = {
      _id: 'checkpoint-1',
      lastUpdateDate: new Date(),
      path: '/path/to/checkpoint',
      processedFiles: ['file1.jpg', 'file2.jpg'],
    };

    await helper.saveOrUpdate(checkpointEntity, { _id: 'checkpoint-1' })();

    const updateResult = await repo.update('checkpoint-1', newFiles)();

    expectRight(updateResult, (updatedCheckpoint) => {
      expect(updatedCheckpoint.processedFiles).toContain('new-file.jpg');
    });
  });

  it('should return an error when updating a non-existing checkpoint', async () => {
    const updateResult = await repo.update('non-existing-id', new Set())();

    expectLeft(updateResult, (error) => {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('Checkpoint with ID');
    });
  });
});
