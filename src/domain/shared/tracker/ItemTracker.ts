import { pipe } from 'fp-ts/lib/function.js';
import * as O from 'fp-ts/lib/Option.js';

export type ItemCallback = (params: TrackParams) => void;

export type TrackParams = {
  currentItem: TrackerItem;
  total: number;
  allItems: TrackerItem[];
};

export enum ItemState {
  PROCESS = 'PROCESS',
  UNPROCESS = 'UNPROCESS',
  ERROR = 'ERROR',
}

export type NormalItem = {
  id: string;
  state: ItemState.PROCESS | ItemState.UNPROCESS;
};

export type ErrorItem = {
  id: string;
  state: ItemState.ERROR;
  errorMessage: string;
};

export type TrackerItem = NormalItem | ErrorItem;

export class ItemTracker {
  private readonly items: Map<string, TrackerItem>;
  private readonly onItemTrack: ItemCallback;

  private constructor(
    items: Map<string, TrackerItem>,
    onItemChange: ItemCallback,
  ) {
    this.items = items;
    this.onItemTrack = onItemChange;
  }

  static init(onItemChange: ItemCallback): ItemTracker {
    return new ItemTracker(new Map(), onItemChange);
  }

  track(item: TrackerItem): this {
    return pipe(
      O.fromNullable(this.items.get(item.id)),
      O.alt(() => O.some(item)),
      O.map((newItem) => {
        const updatedItems = new Map(this.items).set(item.id, newItem);
        const allItems = [...updatedItems.values()];

        this.onItemTrack({
          currentItem: { ...newItem },
          total: updatedItems.size,
          allItems: allItems.map((item) => ({ ...item })),
        });

        return new ItemTracker(updatedItems, this.onItemTrack) as this;
      }),
      O.getOrElse(() => this),
    );
  }
}
