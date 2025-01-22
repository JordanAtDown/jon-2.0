import { CheckpointData } from '../../sharedkernel/checkpoint/CheckpointData';

type CheckpointFindCommand = {
  filter: Partial<CheckpointData>;
};

export default CheckpointFindCommand;
