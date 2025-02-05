import { describe, it, expect } from 'vitest';
import HashDateGenerator from '../../../../infra/shared/tag/HashDateGenerator.js';
import { expectNone, expectSome } from '../../../shared/utils/test/Expected.js';

describe('HashDateGenerator', () => {
  const sampleDictionary: Record<string, string> = {
    event1: '2023-11-01T10:00:00',
    event2: '2025-03-15T18:30:00',
    event3: 'invalid-date',
    event4: '2021-07-10',
    birthday: '1985-12-25T00:00:00',
  };

  const generator = new HashDateGenerator(sampleDictionary);

  it('should return a valid DateTime object for a valid ISO date key', () => {
    const result = generator.generate('event1');

    expectSome(result, (date) => {
      expect(
        date.toISO({ suppressMilliseconds: true, includeOffset: false }),
      ).toBe('2023-11-01T10:00:00');
    });
  });

  it('should return none for an invalid date key', () => {
    const result = generator.generate('event3');

    expectNone(result);
  });

  it('should return none for a key not present in the dictionary', () => {
    const result = generator.generate('nonexistent');

    expectNone(result);
  });

  it('should correctly parse and return a DateTime object for a date without time', () => {
    const result = generator.generate('event4');

    expectSome(result, (date) => {
      expect(date.toISODate()).toBe('2021-07-10');
    });
  });

  it('should handle past dates correctly', () => {
    const result = generator.generate('birthday');

    expectSome(result, (date) => {
      expect(
        date.toISO({ suppressMilliseconds: true, includeOffset: false }),
      ).toBe('1985-12-25T00:00:00');
    });
  });

  it('should be case sensitive with keys', () => {
    const result = generator.generate('Event1'); // Note the capitalization

    expectNone(result);
  });
});
