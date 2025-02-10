import {
  ItemState,
  TrackParams,
} from '../../../domain/shared/tracker/ItemTracker.js';
import { Widgets } from 'blessed';
import { Logger } from '../utils/Logger.js';

export const onItemTrack = (
  logBox: Widgets.Log,
  screen: Widgets.Screen,
  statusProcess: Widgets.BoxElement,
) => {
  return (trackParams: TrackParams) => {
    const { allItems, currentItem, total } = trackParams;
    updateProcessStatus(allItems, total, statusProcess);
    updateLog(currentItem, logBox);
    screen.render();
  };
};
const updateProcessStatus = (
  allItems: TrackParams['allItems'],
  total: TrackParams['total'],
  statusProcess: Widgets.BoxElement,
) => {
  const unprocessCount = allItems.filter(
    (item) => item.state === ItemState.UNPROCESS,
  ).length;
  const unprocessRatio =
    total > 0 ? ((unprocessCount / total) * 100).toFixed(2) : '0';
  Logger.info(`Unprocess files ${unprocessRatio} % - on ${total} files`);
  statusProcess.setContent(
    `Unprocess files ${unprocessRatio} % on ${total} files`,
  );
};

const updateLog = (
  currentItem: TrackParams['currentItem'],
  logBox: Widgets.Log,
) => {
  const { state, id } = currentItem;

  let errorDetails = '';
  if (state === ItemState.ERROR && 'errorMessage' in currentItem) {
    errorDetails =
      `\n{red-fg}Erreur rencontrée :{/red-fg} {bold}${currentItem.errorMessage}{/bold}\n` +
      `{blue-fg}Files concerned : {/blue-fg}{underline}${id}{/underline}\n`;
  }

  const messages: Record<ItemState, string> = {
    [ItemState.ERROR]: `{red-fg}❌ [${state}]{/red-fg} on file {blue-fg}{underline}${id}{/underline}{/blue-fg}${errorDetails}`,
    [ItemState.UNPROCESS]: `{yellow-fg}⚠️ [${state}]{/yellow-fg} on file {blue-fg}{underline}${id}{/underline}{/blue-fg}`,
    [ItemState.PROCESS]: `{green-fg}✅ [${state}]{/green-fg} on file {blue-fg}{underline}${id}{/underline}{/blue-fg}`,
  };

  switch (state) {
    case ItemState.ERROR:
      Logger.error(
        `Error on file - ${id} Message d'erreur : ${'errorMessage' in currentItem ? currentItem.errorMessage : 'Non spécifié'}`,
      );
      break;
    case ItemState.UNPROCESS:
      Logger.warn(`Unprocessed file - ${id}`);
      break;
    case ItemState.PROCESS:
      Logger.info(`Processed file - ${id}`);
      break;
  }

  logBox.log(messages[state]);
};
