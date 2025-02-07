import { Progress } from '../../../domain/shared/tracker/Progress.js';
import { TrackerItem } from '../../../domain/shared/tracker/ItemTracker.js';

export const trackProgress = (progress: Progress): void => {
  console.log('current', progress.current);
  console.log('total', progress.total);
};

export const trackItem = (
  item: TrackerItem,
  totalCount: number,
  allItems: TrackerItem[],
): void => {
  console.log('current', item);
  console.log('total', totalCount);
};
