import { PipelineStep } from './PipelineStep.js';
import * as TE from 'fp-ts/lib/TaskEither.js';

/**
 * Creates a generic pipeline step that wraps a provided asynchronous function
 * with error handling using fp-ts's `TaskEither`.
 *
 * @template Input - The type of the input for the pipeline step.
 * @template Output - The type of the output for the pipeline step.
 * @param taskFn - An asynchronous function that processes the input and returns
 *                 a Promise resolving to the output.
 * @param errorMessage - A custom error message to include when the task fails.
 * @returns A `PipelineStep` that wraps the provided function with standardized error handling.
 *
 * @example
 * // Define an async function
 * const exampleTask = async (input: number): Promise<string> => {
 *   if (input > 0) {
 *     return `Input is ${input}`;
 *   } else {
 *     throw new Error('Input must be positive');
 *   }
 * };
 *
 * // Create a pipeline step
 * const step = createGenericStep(exampleTask, 'Task failed');
 *
 * // Execute the pipeline step
 * step(5)()
 *   .then(result => {
 *     if (result._tag === 'Right') {
 *       console.log(result.right); // Output: "Input is 5"
 *     } else {
 *       console.error(result.left.message); // Error handling
 *     }
 *   });
 */

export const createGenericStep =
  <Input, Output>(
    taskFn: (input: Input) => Promise<Output>,
    errorMessage: string,
  ): PipelineStep<Input, Output> =>
  (input) =>
    TE.tryCatch(
      () => taskFn(input),
      (reason) => new Error(`${errorMessage}: ${String(reason)}`),
    );
