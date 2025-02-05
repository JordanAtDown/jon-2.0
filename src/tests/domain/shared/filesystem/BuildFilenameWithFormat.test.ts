import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import buildFilenameWithFormat from '../../../../domain/shared/filesystem/BuildFilenameWithFormat.js';

describe('buildFilename', () => {
  const testCases = [
    {
      date: DateTime.fromISO('2023-12-25T15:30:45'),
      extension: '.txt',
      type: 'document',
      expected: 'document_2023_12_25-15_30_45.txt',
    },
    {
      date: DateTime.fromISO('2023-01-01T00:00:00'),
      extension: '.log',
      type: 'backup',
      expected: 'backup_2023_01_01-00_00_00.log',
    },
    {
      date: DateTime.fromISO('2023-07-04T09:15:30'),
      extension: '.json',
      type: 'data',
      expected: 'data_2023_07_04-09_15_30.json',
    },
  ];

  testCases.forEach(({ date, extension, type, expected }) => {
    it(`should correctly build filename for type="${type}", extension="${extension}"`, () => {
      const result = buildFilenameWithFormat(date, extension, type);
      expect(result).toBe(expected);
    });
  });
});
