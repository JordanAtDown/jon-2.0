import ProgressTracker from './ProgressTracker.js';

class WrapperMutableProgressTracker {
  private tracker: ProgressTracker;

  constructor(initialTracker: ProgressTracker) {
    this.tracker = initialTracker;
  }

  increment(): ProgressTracker {
    this.tracker = this.tracker.increment();
    return this.tracker;
  }

  isComplete(): boolean {
    return this.tracker.isComplete();
  }

  getTracker(): ProgressTracker {
    return this.tracker;
  }
}

export default WrapperMutableProgressTracker;
