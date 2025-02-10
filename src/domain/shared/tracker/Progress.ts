type Progress = {
  total: number;
  current: number;
  timeDelta: number;
};

type ProgressCallback = (progress: Progress) => void;

export { Progress, ProgressCallback };
