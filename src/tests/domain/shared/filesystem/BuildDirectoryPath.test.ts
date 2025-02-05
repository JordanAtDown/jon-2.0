import { describe, it } from 'vitest';
import { expect } from 'vitest';
import { DateTime } from 'luxon';
import { buildDirectoryPath } from '../../../../domain/shared/filesystem/BuildDirectoryPath.js';

describe('BuildDirectoryPath', () => {
  const destDir = '/destination';
  const defaultFilename = 'file.txt';

  const testCases = [
    {
      description: 'should build a path with year and month for a valid date',
      date: DateTime.fromISO('2023-03-15'),
      expected: '/destination/2023/03/file.txt',
    },
    {
      description:
        'should build a path without year and month for an invalid date',
      date: DateTime.invalid('Invalid date'),
      expected: '/destination/file.txt',
    },
    {
      description:
        'should build a path without year and month when date is null',
      date: null as unknown as DateTime,
      expected: '/destination/file.txt',
    },
    {
      description:
        'should build a path with padded month when month is less than 10',
      date: DateTime.fromISO('2023-01-01'),
      expected: '/destination/2023/01/file.txt',
    },
    {
      description: 'should build a correct path with a custom filename',
      date: DateTime.fromISO('2023-11-05'),
      filename: 'myfile.png',
      expected: '/destination/2023/11/myfile.png',
    },
  ];

  testCases.forEach(
    ({ description, date, filename = defaultFilename, expected }) => {
      it(description, () => {
        const result = buildDirectoryPath(destDir, date, filename);
        expect(result).toBe(expected);
      });
    },
  );
});
