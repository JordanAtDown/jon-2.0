import { screenComponent } from './ScreenComponent.js';
import { progressBar } from './ProgressBar.js';
import { statusETA } from './StatusETA.js';
import { logComponent } from './LogComponent.js';
import { onItemTrack } from './OnItemTrack.js';
import { onProgressUpdate } from './OnProgressUpdate.js';
import { statusProcessComponent } from './StatusProcessComponent.js';
import { Widgets } from 'blessed';

export const initializeTrackingView = () => {
  const screen = screenComponent();
  const progressBarComponent = progressBar(screen);
  const statusETAComponent = statusETA(screen);
  const log = logComponent(screen);
  const statusProcess = statusProcessComponent(screen);
  return {
    screen,
    progressBarComponent,
    statusETAComponent,
    log,
    statusProcess,
  };
};

export const createOnCallbacks = (
  progressBarComponent: Widgets.ProgressBarElement,
  statusETAComponent: Widgets.BoxElement,
  log: Widgets.Log,
  screen: Widgets.Screen,
  statusProcess: Widgets.BoxElement,
) => {
  const onItemTrackCallback = onItemTrack(log, screen, statusProcess);
  const onProgressUpdateCallback = onProgressUpdate(
    progressBarComponent,
    statusETAComponent,
    screen,
  );

  return {
    onItemTrackCallback,
    onProgressUpdateCallback,
  };
};
