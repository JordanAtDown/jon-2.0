import { CategorySource } from '../../sharedkernel/checkpoint/CheckpointData';

type CheckpointCreateCommand = {
  source: string;
  category: CategorySource;
};

const CheckpointDirectoryCreateCommand = (
  source: string,
): CheckpointCreateCommand => {
  return {
    source,
    category: CategorySource.Dir,
  };
};

const CheckpointDBCreateCommand = (source: string): CheckpointCreateCommand => {
  return {
    source,
    category: CategorySource.ID,
  };
};

export {
  CheckpointCreateCommand,
  CheckpointDirectoryCreateCommand,
  CheckpointDBCreateCommand,
};
