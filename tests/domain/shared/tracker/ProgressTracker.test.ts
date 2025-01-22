import { describe, expect, it } from 'vitest';
import ProgressTracker from '../../../../src/domain/shared/tracker/ProgressTracker';
import { Progress } from '../../../../src/domain/shared/tracker/Progress';

describe('ProgressTracker (parametrized tests)', () => {
  it.each([
    {
      total: 5,
      increments: 0,
      expectedUpdates: [{ total: 5, current: 0 }],
      isComplete: false,
    },
    {
      total: 5,
      increments: 1,
      expectedUpdates: [
        { total: 5, current: 0 },
        { total: 5, current: 1 },
      ],
      isComplete: false,
    },
    {
      total: 3,
      increments: 3,
      expectedUpdates: [
        { total: 3, current: 0 },
        { total: 3, current: 1 },
        { total: 3, current: 2 },
        { total: 3, current: 3 },
      ],
      isComplete: true,
    },
    {
      total: 1,
      increments: 2,
      expectedUpdates: [
        { total: 1, current: 0 },
        { total: 1, current: 1 },
        { total: 1, current: 2 },
      ],
      isComplete: true,
    },
  ])(
    'should correctly track progress for total: $total with $increments increments',
    ({ total, increments, expectedUpdates, isComplete }) => {
      const updates: Array<Progress> = [];
      let tracker = ProgressTracker.init(total, (update) =>
        updates.push(update),
      );

      for (let i = 0; i < increments; i++) {
        tracker = tracker.increment();
      }

      expect(updates).toEqual(expectedUpdates);
      expect(tracker.isComplete()).toBe(isComplete);
    },
  );
});
