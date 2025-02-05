import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { ExifDateTime } from 'exiftool-vendored';
import { matchDateTimeOriginal } from '../../../../../domain/shared/extractor/matcher/MatchDateTimeOriginal.js';
import {
  expectNone,
  expectSome,
} from '../../../../shared/utils/test/Expected.js';

describe('MatchDateTimeOriginal', () => {
  it.each([
    {
      input: '2023-10-26T15:30:00',
      expected: DateTime.fromISO('2023-10-26T15:30:00'),
    },
    {
      input: ExifDateTime.fromISO('2023-10-26'),
      expected: 'Invalid',
    },
    {
      input: ExifDateTime.fromISO('2023-10-26T15:30:45'),
      expected: DateTime.fromObject({
        year: 2023,
        month: 10,
        day: 26,
        hour: 15,
        minute: 30,
        second: 45,
      }),
    },
  ])(
    'should convert correctly $input into $expected',
    ({ input, expected }) => {
      const result = matchDateTimeOriginal(input!);

      if (expected === 'Invalid') {
        expectNone(result);
      } else {
        expectSome(result, (result) => {
          expect(result).toEqual(expected);
        });
      }
    },
  );
});
