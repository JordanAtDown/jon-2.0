import { describe, it } from 'vitest';
import { expect } from 'vitest';
import { DateTime } from 'luxon';
import { buildDirectoryPath } from '../../../../domain/shared/filesystem/BuildDirectoryPath.js';

describe('BuildDirectoryPath', () => {
  const destDir = '/destination';
  const defaultFilename = 'file.txt';

  describe('Default behavior tests', () => {
    const testCases = [
      {
        description: 'should build a path with year and month for a valid date',
        date: DateTime.fromISO('2023-03-15'),
        format: 'YYYY/MM',
        expected: '/destination/2023/03/file.txt',
      },
      {
        description:
          'should build a path without year and month for an invalid date',
        date: DateTime.invalid('Invalid date'),
        format: 'YYYY/MM',
        expected: '/destination/file.txt',
      },
      {
        description:
          'should build a path without year and month when date is null',
        date: null as unknown as DateTime,
        format: 'YYYY/MM',
        expected: '/destination/file.txt',
      },
      {
        description:
          'should build a path with padded month when month is less than 10',
        date: DateTime.fromISO('2023-01-01'),
        format: 'YYYY/MM',
        expected: '/destination/2023/01/file.txt',
      },
    ];

    testCases.forEach(({ description, date, format, expected }) => {
      it(description, () => {
        const result = buildDirectoryPath(
          destDir,
          { date, type: 'photo', extension: '.jpg' },
          defaultFilename,
          format,
        );
        expect(result).toBe(expected);
      });
    });
  });

  describe('Custom format tests', () => {
    const customTestCases = [
      {
        description: 'should build path with year, month, and type',
        date: DateTime.fromISO('2023-11-05'),
        format: 'YYYY/MM/TYPE',
        expected: '/destination/2023/11/PHOTO/file.txt',
      },
      {
        description: 'should build path with year, month, and extension',
        date: DateTime.fromISO('2023-11-05'),
        format: 'YYYY/MM/EXT',
        expected: '/destination/2023/11/JPG/file.txt',
      },
      {
        description: 'should build path with type first, then year and month',
        date: DateTime.fromISO('2023-11-05'),
        format: 'TYPE/YYYY/MM',
        expected: '/destination/PHOTO/2023/11/file.txt',
      },
      {
        description: 'should build path with year and extension only',
        date: DateTime.fromISO('2023-11-05'),
        format: 'YYYY/EXT',
        expected: '/destination/2023/JPG/file.txt',
      },
      {
        description:
          'should build path with padded month and custom format containing type and extension',
        date: DateTime.fromISO('2023-01-20'),
        format: 'TYPE/MM/EXT',
        expected: '/destination/PHOTO/01/JPG/file.txt',
      },
    ];

    customTestCases.forEach(({ description, date, format, expected }) => {
      it(description, () => {
        const result = buildDirectoryPath(
          destDir,
          { date, type: 'photo', extension: '.jpg' },
          defaultFilename,
          format,
        );
        expect(result).toBe(expected);
      });
    });
  });

  describe('Edge cases tests', () => {
    const edgeCaseTests = [
      {
        description: 'should handle empty format',
        date: DateTime.fromISO('2023-12-01'),
        format: '',
        expected: '/destination/file.txt',
      },
      {
        description: 'should ignore unsupported placeholders',
        date: DateTime.fromISO('2023-12-01'),
        format: 'YYYY/MM/UNSUPPORTED',
        expected: '/destination/2023/12/UNSUPPORTED/file.txt',
      },
      {
        description: 'should handle format with only text',
        date: DateTime.fromISO('2023-07-15'),
        format: 'static/path',
        expected: '/destination/static/path/file.txt',
      },
      {
        description:
          'should handle invalid date with valid format but default to destDir',
        date: DateTime.invalid('Invalid date'),
        format: 'YYYY/MM',
        expected: '/destination/file.txt',
      },
    ];

    edgeCaseTests.forEach(({ description, date, format, expected }) => {
      it(description, () => {
        const result = buildDirectoryPath(
          destDir,
          { date, type: 'photo', extension: '.jpg' },
          defaultFilename,
          format,
        );
        expect(result).toBe(expected);
      });
    });
  });
});
