import { Progress } from '../../../domain/shared/tracker/Progress.js';
import { Widgets } from 'blessed';

export const onProgressUpdate = (
  bar: Widgets.ProgressBarElement,
  statusETA: Widgets.BoxElement,
  screen: Widgets.Screen,
) => {
  return (progress: Progress) => {
    const percentage = Math.floor((progress.current / progress.total) * 100);
    bar.setProgress(percentage);

    if (progress.current > 0) {
      const elapsedTimePerStep = progress.timeDelta / progress.current;
      const remainingSteps = progress.total - progress.current;
      const estimatedTimeRemaining = remainingSteps * elapsedTimePerStep;
      statusETA.setContent(
        `Temps restant estimé : ${formatTime(estimatedTimeRemaining)}`,
      );
      bar.setContent(
        `${percentage}% - ${progress.current} / ${progress.total}`,
      );
    } else {
      statusETA.setContent('Calcul en cours...');
    }

    screen.render();
  };
};

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} minute(s) ${seconds} seconde(s)`;
};
