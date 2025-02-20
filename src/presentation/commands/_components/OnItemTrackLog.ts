import {
  ItemState,
  TrackParams,
} from '../../../domain/shared/tracker/ItemTracker.js';
import Logger from '../utils/Logger.js';

export const onItemTrackLog = (trackParams: TrackParams) => {
  const { allItems, currentItem, total } = trackParams;
  updateProcessStatus(allItems, total);
  updateLog(currentItem);
};
const updateProcessStatus = (
  allItems: TrackParams['allItems'],
  total: TrackParams['total'],
) => {
  const unprocessCount = allItems.filter(
    (item) => item.state === ItemState.UNPROCESS,
  ).length;
  const unprocessRatio =
    total > 0 ? ((unprocessCount / total) * 100).toFixed(2) : '0';
  Logger.info(`Unprocess files ${unprocessRatio} % - on ${total} files`);
};

const updateLog = (currentItem: TrackParams['currentItem']) => {
  const { state, id } = currentItem;

  switch (state) {
    case ItemState.ERROR:
      Logger.error(
        `Error on file - '${id}' Message d'erreur : ${'errorMessage' in currentItem ? currentItem.errorMessage : 'Non spécifié'}`,
      );
      break;
    case ItemState.UNPROCESS:
      Logger.warn(`UNPROCESS file - '${id}'`);
      break;
    case ItemState.PROCESS:
      Logger.verbose(`Processed file - '${id}'`);
      break;
  }
};
