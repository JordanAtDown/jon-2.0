import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest';
import CheckpointDatastoreHelper from '../../../../src/infra/shared/utils/CheckpointDatastoreHelper';
import initializeDatabase from '../../../../src/infra/shared/utils/InitializeDatabase';
import { deleteFileOrDirectory } from '../../../../src/domain/shared/utils/test/Filesystem';
import {
  expectLeft,
  expectRight,
  expectSome,
} from '../../../../src/domain/shared/utils/test/Expected';
import NeDBCheckpoint from '../../../../src/infra/sharedkernel/checkpoint/NeDBCheckpoint';
import CheckpointEntity from '../../../../src/infra/sharedkernel/checkpoint/CheckpointEntity';
import { CategorySource } from '../../../../src/domain/sharedkernel/checkpoint/CheckpointData';

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
    const date = new Date();
    const checkpointEntity: CheckpointEntity = {
      _id: 'checkpoint-1',
      category: 'ID',
      lastUpdate: date,
      processed: ['file1.jpg', 'file2.jpg'],
      source: '/path/to/checkpoint',
    };

    await helper.saveOrUpdate(checkpointEntity, { _id: 'checkpoint-1' })();

    const result = await repo.findBy('checkpoint-1')();
    expectRight(result, (checkpointData) => {
      expectSome(checkpointData, (data) => {
        expect(data).toEqual(
          expect.objectContaining({
            _id: 'checkpoint-1',
            category: 'ID',
            lastUpdate: date,
            processed: expect.arrayContaining(['file1.jpg', 'file2.jpg']),
            source: '/path/to/checkpoint',
          }),
        );
      });
    });
  });

  it('should update an existing checkpoint', async () => {
    const initialDate = new Date('2023-11-01T10:00:00.000Z');
    const newFiles = new Set(['new-file.jpg']);

    const checkpointEntity: CheckpointEntity = {
      _id: 'checkpoint-1',
      category: 'ID',
      lastUpdate: initialDate,
      source: '/path/to/checkpoint',
      processed: ['file1.jpg', 'file2.jpg'],
    };

    await helper.saveOrUpdate(checkpointEntity, { _id: 'checkpoint-1' })();

    const updateResult = await repo.update('checkpoint-1', newFiles)();

    expectRight(updateResult, (updatedCheckpoint) => {
      expect(updatedCheckpoint.processed).toContain('new-file.jpg');
      expect(updatedCheckpoint.processed).toEqual(
        expect.arrayContaining(['file1.jpg', 'file2.jpg', 'new-file.jpg']),
      );
      expect(updatedCheckpoint.lastUpdate).not.toEqual(initialDate);
      expect(updatedCheckpoint).toEqual(
        expect.objectContaining({
          _id: 'checkpoint-1',
          category: 'ID',
          source: '/path/to/checkpoint',
        }),
      );
    });
  });

  it('should return an error when updating a non-existing checkpoint', async () => {
    const updateResult = await repo.update('non-existing-id', new Set())();

    expectLeft(updateResult, (error) => {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('Checkpoint with ID');
    });
  });

  it('should create a new checkpoint', async () => {
    const date = new Date();
    const newCheckpoint = {
      _id: '',
      category: CategorySource.ID,
      lastUpdate: date,
      processed: ['test1.jpg', 'test2.jpg'],
      source: '/path/to/test',
    };

    const result = await repo.create(newCheckpoint)();

    expectRight(result, (createdCheckpoint) => {
      expect(createdCheckpoint).toEqual(
        expect.objectContaining({
          category: 'ID',
          lastUpdate: date,
          processed: expect.arrayContaining(['test1.jpg', 'test2.jpg']),
          source: '/path/to/test',
        }),
      );
      expect(createdCheckpoint._id).toBeDefined();
      expect(createdCheckpoint._id).not.toEqual('');
    });
  });
});
