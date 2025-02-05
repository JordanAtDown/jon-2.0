import { match, Matcher } from 'domain/shared/utils/fp/PatternMatcher.js';
import { describe, expect, test } from 'vitest';
import {
  expectNone,
  expectSome,
} from '../../../../shared/utils/test/Expected.js';

const isEven: Matcher<number, string> = [
  (value) => value % 2 === 0,
  () => 'Even',
];

const isOdd: Matcher<number, string> = [
  (value) => value % 2 !== 0,
  () => 'Odd',
];

describe('match function', () => {
  test.each([
    [2, 'Even'],
    [3, 'Odd'],
    [0, 'Even'],
    [11, 'Odd'],
  ])('matches value %p and expects Some(%p)', (value, expected) => {
    const result = match(isEven, isOdd)(value as number);
    expectSome(result, (res) => {
      expect(res).toBe(expected);
    });
  });

  test('returns None when value is undefined', () => {
    const result = match(isEven, isOdd)(undefined as unknown as number);
    expectNone(result);
  });

  test('returns None when value is null', () => {
    const result = match(isEven, isOdd)(null as unknown as number);
    expectNone(result);
  });

  test('returns None when no match is found', () => {
    const alwaysFailMatcher: Matcher<number, string> = [
      () => false,
      () => 'Should Never Match',
    ];

    const result = match(alwaysFailMatcher)(5);
    expectNone(result);
  });
});
