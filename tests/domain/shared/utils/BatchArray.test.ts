import { describe, it, expect } from 'vitest';
import { batchArray } from '../../../../src/domain/shared/utils/batch/BatchArray';

describe('batchArray', () => {
  const cases = [
    {
      description: 'handles an empty array',
      input: { array: [], batchSize: 2 },
      output: [],
    },
    {
      description: 'handles batch size of 0',
      input: { array: [1, 2, 3], batchSize: 0 },
      output: [],
    },
    {
      description: 'handles batch size of 1',
      input: { array: [1, 2, 3], batchSize: 1 },
      output: [[1], [2], [3]],
    },
    {
      description: 'handles batch size greater than array length',
      input: { array: [1, 2, 3], batchSize: 5 },
      output: [[1, 2, 3]],
    },
    {
      description: 'handles batch size equal to array length',
      input: { array: [1, 2, 3], batchSize: 3 },
      output: [[1, 2, 3]],
    },
    {
      description: 'splits array into evenly sized batches',
      input: { array: [1, 2, 3, 4, 5, 6], batchSize: 2 },
      output: [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
    },
    {
      description:
        'includes a smaller last batch when array cannot be evenly divided',
      input: { array: [1, 2, 3, 4, 5], batchSize: 2 },
      output: [[1, 2], [3, 4], [5]],
    },
    {
      description: 'handles an array with only one element',
      input: { array: [1], batchSize: 3 },
      output: [[1]],
    },
    {
      description: 'works with arrays containing non-numeric values',
      input: { array: ['a', 'b', 'c', 'd'], batchSize: 2 },
      output: [
        ['a', 'b'],
        ['c', 'd'],
      ],
    },
    {
      description: 'works with generic types (objects)',
      input: { array: [{ id: 1 }, { id: 2 }, { id: 3 }], batchSize: 2 },
      output: [[{ id: 1 }, { id: 2 }], [{ id: 3 }]],
    },
  ];

  cases.forEach(({ description, input, output }) => {
    it(`should ${description}`, () => {
      const result = batchArray<(typeof input.array)[0]>(
        input.array,
        input.batchSize,
      );
      expect(result).toEqual(output);
    });
  });
});
