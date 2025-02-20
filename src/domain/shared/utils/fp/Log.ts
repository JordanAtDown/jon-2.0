import { performance } from 'node:perf_hooks';
import * as TE from 'fp-ts/lib/TaskEither.js';
import * as E from 'fp-ts/lib/Either.js';
import Logger from '../../../../presentation/commands/utils/Logger.js';

/**
 * Measure and log the execution time of a complete TaskEither pipeline and log the input parameters.
 *
 * @param name - The identifier for the step being logged.
 * @param params - The input parameters to log.
 * @param task - The main TaskEither pipeline to execute and measure.
 * @returns A wrapped TaskEither pipeline with timing information.
 */
export function withLogTimingWithParams<ErrorType, ResultType, ParamsType>(
  name: string,
  params: ParamsType,
  task: TE.TaskEither<ErrorType, ResultType>,
): TE.TaskEither<ErrorType, ResultType> {
  return TE.tryCatch(
    async () => {
      const start = performance.now();
      Logger.info(
        `[${name}] started with parameters: ${JSON.stringify(params)}`,
      );
      const result = await task();
      const end = performance.now();

      if (E.isRight(result)) {
        Logger.info(
          `[${name}] completed successfully in ${(end - start).toFixed(2)}ms`,
        );
        return result.right;
      } else {
        Logger.error(
          `[${name}] failed after ${(end - start).toFixed(2)}ms - Error: ${result.left}`,
        );
        throw result.left;
      }
    },
    (error) => error as ErrorType,
  );
}
