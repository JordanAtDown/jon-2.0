import { ItemTracker, TrackerItem } from './ItemTracker.js';

class WrapperMutableItemTracker {
  private tracker: ItemTracker;

  constructor(initialTracker: ItemTracker) {
    this.tracker = initialTracker;
  }

  track(item: TrackerItem): ItemTracker {
    this.tracker = this.tracker.track(item);
    return this.tracker;
  }

  getTracker(): ItemTracker {
    return this.tracker;
  }
}

export default WrapperMutableItemTracker;
