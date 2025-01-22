type CheckpointData = {
  _id: string;
  category: CategorySource;
  lastUpdate: Date;
  source: string;
  processed: string[];
};

enum CategorySource {
  Dir = 'DIR',
  ID = 'ID',
}

export { CheckpointData, CategorySource };
