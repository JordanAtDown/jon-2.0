import { PipelineStep } from './PipelineStep.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { initializeTrackingView } from '../_components/InitializeTrackingView.js';
import { createOnCallbacks } from '../_components/InitializeTrackingView.js';
import { ItemCallback } from '../../../domain/shared/tracker/ItemTracker.js';
import { ProgressCallback } from '../../../domain/shared/tracker/Progress.js';

export interface TrackingCallbacks {
  onItemTrackCallback: ItemCallback;
  onProgressUpdateCallback: ProgressCallback;
}

export const initializeUIStep: PipelineStep<void, TrackingCallbacks> = () =>
  pipe(
    TE.tryCatch(
      async () => initializeTrackingView(),
      (error) =>
        error instanceof Error
          ? error
          : new Error("Erreur lors de l'initialisation de la vue de suivi."),
    ),
    TE.map(
      ({
        screen,
        progressBarComponent,
        statusETAComponent,
        log,
        statusProcess,
      }) => {
        return createOnCallbacks(
          progressBarComponent,
          statusETAComponent,
          log,
          screen,
          statusProcess,
        );
      },
    ),
    TE.map(({ onItemTrackCallback, onProgressUpdateCallback }) => ({
      onItemTrackCallback,
      onProgressUpdateCallback,
    })),
  );
