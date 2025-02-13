import * as TE from 'fp-ts/lib/TaskEither.js';

/**
 * Represents a single step in a processing pipeline, where an input is transformed
 * into an output asynchronously, with potential error handling using fp-ts's `TaskEither`.
 *
 * @template Input - The type of the input for the pipeline step.
 * @template Output - The type of the output for the pipeline step.
 *
 * @example
 * import * as TE from 'fp-ts/lib/TaskEither';
 *
 * // Example pipeline step: converts a number to a string
 * const exampleStep: PipelineStep<number, string> = (input) =>
 *   input > 0
 *     ? TE.right(`Input was ${input}`)
 *     : TE.left(new Error('Input must be greater than 0'));
 *
 * // Execute the pipeline step
 * exampleStep(5)()
 *   .then(result => {
 *     if (result._tag === 'Right') {
 *       console.log(result.right); // Output: "Input was 5"
 *     } else {
 *       console.error(result.left.message); // Output: "Input must be greater than 0" (if input <= 0)
 *     }
 *   });
 */
export type PipelineStep<Input, Output> = (
  input: Input,
) => TE.TaskEither<Error, Output>;
