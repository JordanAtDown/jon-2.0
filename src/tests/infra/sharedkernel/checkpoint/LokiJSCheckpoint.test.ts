import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import path from 'path';
import LokiJSCheckpoint from '../../../../infra/sharedkernel/checkpoint/LokiJSCheckpoint.js';
import { deleteFileOrDirectory } from 'tests/shared/utils/test/Filesystem.js';
import {
  expectSome,
  expectTaskEitherRight,
} from '../../../shared/utils/test/Expected.js';
import {
  CategorySource,
  CheckpointData,
} from '../../../../domain/sharedkernel/checkpoint/CheckpointData.js';
import CheckpointDBHelper from '../../utils/CheckpointDBHelper.js';
import initializeDB from '../../utils/InitializeDB.js';
import { DateTime } from 'luxon';

describe('LokiJSCheckpoint', () => {
  const tempDir = path.join(__dirname, 'lokijscheckpoint');
  let repo: LokiJSCheckpoint;
  let helper: CheckpointDBHelper;

  beforeAll(async () => {
    const dbConfig = await initializeDB(tempDir);
    const checkpointDB: Loki = dbConfig.checkpointDB;
    repo = new LokiJSCheckpoint(checkpointDB);
    helper = new CheckpointDBHelper(checkpointDB);
  });

  afterAll(async () => {
    await deleteFileOrDirectory(tempDir);
  });

  it('should successfully find and aggregate by ID', async () => {
    const checkpointEntities = [
      {
        _id: 'checkpoint-1',
        category: 'ID',
        lastUpdate: '2023-11-01T10:00:00',
        processed: ['file1.jpg', 'file2.jpg'],
        source: '/path/to/checkpoint',
      },
      {
        _id: 'checkpoint-1',
        category: 'ID',
        lastUpdate: '2023-11-01T10:01:00',
        processed: ['file3.jpg', 'file4.jpg'],
        source: '/path/to/checkpoint',
      },
      {
        _id: 'checkpoint-2',
        category: 'DIR',
        lastUpdate: '2023-11-02T10:01:00',
        processed: ['file34.jpg', 'file45.jpg'],
        source: '/path/NOT/to/checkpoint',
      },
    ];
    await helper.addAll(checkpointEntities)();

    const result = repo.findBy('checkpoint-1');

    await expectTaskEitherRight(result, (checkpointData) => {
      expectSome(checkpointData, (aggreatedCheckpointData) => {
        expect(aggreatedCheckpointData._id).toEqual('checkpoint-1');
        expect(aggreatedCheckpointData.category).toEqual('ID');
        expect(
          aggreatedCheckpointData.lastUpdate.toISO({
            suppressMilliseconds: true,
            includeOffset: false,
          }),
        ).toEqual('2023-11-01T10:01:00');
        expect(aggreatedCheckpointData.source).toEqual('/path/to/checkpoint');
        expect(aggreatedCheckpointData.processed).toEqual(
          new Set(['file1.jpg', 'file2.jpg', 'file3.jpg', 'file4.jpg']),
        );
      });
    });
  });

  it('should create a new checkpoint', async () => {
    const newCheckpoint: CheckpointData = {
      _id: 'checkpoint-12',
      category: CategorySource.ID,
      lastUpdate: DateTime.fromISO('2021-01-01T10:00:00'),
      processed: new Set(['file1.jpg', 'file2.jpg', 'file3.jpg', 'file4.jpg']),
      source: '/path/to/test',
    };

    await repo.save(newCheckpoint)();

    const taskEitherFind = helper.find({ _id: 'checkpoint-12' });
    await expectTaskEitherRight(taskEitherFind, (checkpointEntities) => {
      expect(checkpointEntities).toHaveLength(1);
      const checkpointEntity = checkpointEntities[0]!;
      expect(checkpointEntity._id).toEqual('checkpoint-12');
      expect(checkpointEntity.category).toEqual('ID');
      expect(checkpointEntity.lastUpdate).toEqual(
        '2021-01-01T10:00:00.000+01:00',
      );
      expect(checkpointEntity.source).toEqual('/path/to/test');
      expect(checkpointEntity.processed).toEqual([
        'file1.jpg',
        'file2.jpg',
        'file3.jpg',
        'file4.jpg',
      ]);
    });
  });
});
