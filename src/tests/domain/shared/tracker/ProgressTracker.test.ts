import { describe, expect, it, vi } from 'vitest';
import ProgressTracker from '../../../../domain/shared/tracker/ProgressTracker.js';

describe('ProgressTracker', () => {
  it('should initialize correctly with total and onProgress callback', () => {
    const onProgress = vi.fn();

    const tracker = ProgressTracker.init(5, onProgress);

    expect(tracker).toBeInstanceOf(ProgressTracker);
    expect(onProgress).toHaveBeenCalledWith({
      total: 5,
      current: 0,
      timeDelta: 0,
    });
  });

  it('should increment progress correctly and call the onProgress callback', () => {
    const onProgress = vi.fn();
    const tracker = ProgressTracker.init(3, onProgress);

    const incrementedTracker = tracker.increment();

    expect(incrementedTracker).toBeInstanceOf(ProgressTracker);
    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenLastCalledWith(
      expect.objectContaining({
        total: 3,
        current: 1,
        timeDelta: expect.any(Number),
      }),
    );
  });

  it('should return complete status when current >= total', () => {
    const onProgress = vi.fn();
    const tracker = ProgressTracker.init(1, onProgress);
    const incrementedTracker = tracker.increment();

    expect(tracker.isComplete()).toBe(false);
    expect(incrementedTracker.isComplete()).toBe(true);
  });

  it('should handle multiple increments correctly', () => {
    const onProgress = vi.fn();
    const tracker = ProgressTracker.init(3, onProgress);

    const increment1 = tracker.increment();
    const increment2 = increment1.increment();
    const increment3 = increment2.increment();

    expect(onProgress).toHaveBeenCalledTimes(4);
    expect(onProgress).toHaveBeenLastCalledWith({
      total: 3,
      current: 3,
      timeDelta: expect.any(Number),
    });
    expect(increment3.isComplete()).toBe(true);
  });
});
