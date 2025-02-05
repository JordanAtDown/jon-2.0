import { ErrorItem, ItemState, NormalItem } from './ItemTracker.js';

export class ItemTrackerBuilder {
  private id: string | null = null;

  static start(): ItemTrackerBuilder {
    return new ItemTrackerBuilder();
  }

  withId(id: string): NormalOrErrorState {
    this.id = id;
    return new NormalOrErrorState(this.id!);
  }
}

class NormalOrErrorState {
  private readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  asNormalItem(state: ItemState.PROCESS | ItemState.UNPROCESS): NormalItem {
    return {
      id: this.id,
      state,
    };
  }

  asErrorItem(errorMessage: string): ErrorItemBuilder {
    return new ErrorItemBuilder(this.id, errorMessage);
  }
}

class ErrorItemBuilder {
  private readonly id: string;
  private readonly errorMessage: string;

  constructor(id: string, errorMessage: string) {
    this.id = id;
    this.errorMessage = errorMessage;
  }

  build(): ErrorItem {
    return {
      id: this.id,
      state: ItemState.ERROR,
      errorMessage: this.errorMessage,
    };
  }
}
