import { Progress } from '../../../domain/shared/tracker/Progress.js';
import Logger from '../utils/Logger.js';

export const onProgressLog = (progress: Progress) => {
  const percentage = Math.floor((progress.current / progress.total) * 100);

  if (progress.current > 0) {
    const elapsedTimePerStep = progress.timeDelta / progress.current;
    const remainingSteps = progress.total - progress.current;
    const estimatedTimeRemaining = remainingSteps * elapsedTimePerStep;

    Logger.verbose(
      `Temps restant estimé : ${formatTime(estimatedTimeRemaining)}`,
    );
    Logger.verbose(
      `Progression : ${percentage}% - ${progress.current} / ${progress.total}`,
    );
  }
};

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} minute(s) ${seconds} seconde(s)`;
};
