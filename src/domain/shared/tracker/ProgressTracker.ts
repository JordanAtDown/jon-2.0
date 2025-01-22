import { ProgressCallback } from './Progress';

class ProgressTracker {
  private constructor(
    private readonly total: number,
    private readonly current: number,
    private readonly onProgress: ProgressCallback,
  ) {
    this.onProgress({ total, current });
  }

  static init(total: number, onProgress: ProgressCallback): ProgressTracker {
    const initial = 0;
    return new ProgressTracker(total, initial, onProgress);
  }

  increment(): ProgressTracker {
    const increment = this.current + 1;
    return new ProgressTracker(this.total, increment, this.onProgress);
  }

  isComplete(): boolean {
    return this.current >= this.total;
  }
}

export default ProgressTracker;
