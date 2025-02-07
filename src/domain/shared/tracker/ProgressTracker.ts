import { pipe } from 'fp-ts/lib/function.js';
import * as O from 'fp-ts/lib/Option.js';
import { DateTime } from 'luxon';
import { ProgressCallback } from './Progress.js';

class ProgressTracker {
  private constructor(
    private readonly total: number,
    private readonly current: number,
    private readonly onProgress: ProgressCallback,
    private readonly lastIncrementTime: DateTime,
  ) {}

  static init(total: number, onProgress: ProgressCallback): ProgressTracker {
    const initialTime = DateTime.now();
    onProgress({ total: total, current: 0, timeDelta: 0 });
    return new ProgressTracker(total, 0, onProgress, initialTime);
  }

  increment(): this {
    return pipe(
      O.some(DateTime.now()),
      O.map((now) => ({
        timeDelta: now.diff(this.lastIncrementTime).toMillis(),
        nextTracker: new ProgressTracker(
          this.total,
          this.current + 1,
          this.onProgress,
          now,
        ),
      })),
      O.map(({ timeDelta, nextTracker }) => {
        this.onProgress({
          total: nextTracker.total,
          current: nextTracker.current,
          timeDelta,
        });

        return nextTracker as this;
      }),
      O.getOrElse(() => this),
    );
  }

  isComplete(): boolean {
    return this.current >= this.total;
  }
}

export default ProgressTracker;
