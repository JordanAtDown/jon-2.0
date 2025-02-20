import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as TE from 'fp-ts/lib/TaskEither.js';
import Logger from '../../../../../presentation/commands/utils/Logger.js';
import { withLogTimingWithParams } from '../../../../../domain/shared/utils/fp/Log.js';
import {
  expectTaskEitherLeft,
  expectTaskEitherRight,
} from '../../../../shared/utils/test/Expected.js';

vi.mock('../../../../../presentation/commands/utils/Logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('withLogTimingWithParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log start, success, and return result on successful TaskEither', async () => {
    const successTask = TE.right<string, number>(42);
    const params = { foo: 'bar' };

    await expectTaskEitherRight(
      withLogTimingWithParams('Test Success', params, successTask),
      (result: number) => {
        expect(result).toBe(42);
      },
    );

    expect(Logger.info).toHaveBeenCalledWith(
      `[Test Success] started with parameters: {"foo":"bar"}`,
    );
    expect(Logger.info).toHaveBeenCalledWith(
      expect.stringContaining(`[Test Success] completed successfully in`),
    );
  });

  it('should log start, error, and throw error on failing TaskEither', async () => {
    const errorTask = TE.left<string, number>('Something went wrong');
    const params = { foo: 'bar' };

    await expectTaskEitherLeft(
      withLogTimingWithParams('Test Failure', params, errorTask),
      (error: string) => {
        expect(error).toBe('Something went wrong');
      },
    );

    expect(Logger.info).toHaveBeenCalledWith(
      `[Test Failure] started with parameters: {"foo":"bar"}`,
    );
    expect(Logger.error).toHaveBeenCalledWith(
      expect.stringContaining(`[Test Failure] failed after`),
    );
    expect(Logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error: Something went wrong'),
    );
  });
});
