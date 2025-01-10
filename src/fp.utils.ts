import * as TE from 'fp-ts/TaskEither';

export const tryCatchTask = <T>(
  task: () => Promise<T>,
): TE.TaskEither<Error, T> =>
  TE.tryCatch(task, (reason) => new Error(String(reason)));
