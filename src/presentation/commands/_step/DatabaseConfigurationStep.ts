import { PipelineStep } from './PipelineStep.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { DatabaseConfiguration } from '../../../infra/shared/config/DatabaseConfiguration.js';

export const databaseConfigurationStep: PipelineStep<
  string,
  DatabaseConfiguration
> = (appDataPath) => {
  return TE.tryCatch(
    async () => DatabaseConfiguration.getInstance(appDataPath),
    (error) =>
      error instanceof Error
        ? error
        : new Error(
            "Erreur lors de l'initialisation de DatabaseConfiguration.",
          ),
  );
};
