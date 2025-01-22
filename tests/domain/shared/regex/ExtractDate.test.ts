import { describe, expect, test } from 'vitest';
import extractDate from '../../../../src/domain/shared/regex/ExtractDate';
import routes from '../../../../src/domain/shared/regex/Routes';
import {
  expectNone,
  expectSome,
} from '../../../../src/domain/shared/utils/test/Expected';

describe('ExtractDate', () => {
  const testCases = [
    {
      filename: '1999-12-31-summary',
      expected: new Date(1999, 11, 31),
    },
    {
      filename: 'random-20230512-data',
      expected: null,
    },
  ];

  test.each(testCases)(
    'Validate the file $filename',
    ({ filename, expected }) => {
      const result = extractDate(routes, filename);

      expected
        ? expectSome(result, (date) => expect(date).toEqual(expected))
        : expectNone(result);
    },
  );
});
