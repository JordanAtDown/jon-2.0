import { describe, expect, it } from 'vitest';
import * as O from 'fp-ts/Option';
import OccurenceIdentifier from '../../../../src/domain/shared/duplicate/OccurenceIdentifier';
import Occurrences from '../../../../src/domain/shared/duplicate/Occurences';

describe('OccurrenceManager', () => {
  describe('generateUniqueIdentifier', () => {
    it.each([
      {
        description:
          'should generate a unique identifier and decrement the occurrence count',
        initialOccurrences: { key1: 3 },
        inputValue: 'key1',
        expectedId: 1,
        expectedOccurrences: { key1: 2 },
        expectedOption: O.some(1),
      },
      {
        description: 'should return None if the count is 0',
        initialOccurrences: { key1: 0 },
        inputValue: 'key1',
        expectedId: null,
        expectedOccurrences: { key1: 0 },
        expectedOption: O.none,
      },
    ])(
      '$description',
      ({
        initialOccurrences,
        inputValue,
        expectedId,
        expectedOccurrences,
        expectedOption,
      }) => {
        const manager = new OccurenceIdentifier(initialOccurrences);
        const result = manager.generateUniqueIdentifier(inputValue);
        expect(result).toEqual(expectedOption);

        if (O.isSome(result)) {
          expect(result.value).toBe(expectedId);
        }

        expect(manager.getOccurrences()).toEqual(
          Object.entries(expectedOccurrences).map(([key, count]) => ({
            key,
            count,
          })),
        );
      },
    );
  });

  describe('getOccurrences', () => {
    it('should return the correct list of occurrences', () => {
      const occurrences: Occurrences = { key1: 1, key2: 2, key3: 3 };
      const manager = new OccurenceIdentifier(occurrences);

      expect(manager.getOccurrences()).toEqual([
        { key: 'key1', count: 1 },
        { key: 'key2', count: 2 },
        { key: 'key3', count: 3 },
      ]);
    });
  });
});
