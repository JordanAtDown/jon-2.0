import { expect } from 'vitest';
import CheckpointEntity from '../../../../infra/sharedkernel/checkpoint/CheckpointEntity.js';

const validateCheckpointEntity = (entity: CheckpointEntity, expected: any) => {
  expect(entity).toMatchObject({
    _id: expected.id,
    processed: expect.arrayContaining(expected.processed),
    category: expected.category,
    source: expected.source,
  });
};

export { validateCheckpointEntity };
