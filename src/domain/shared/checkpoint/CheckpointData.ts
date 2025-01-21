type CheckpointData = {
  _id: string;
  lastUpdateDate: Date;
  path: string;
  processedFiles: string[];
};

export default CheckpointData;
