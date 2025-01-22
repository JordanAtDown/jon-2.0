type Progress = {
  total: number;
  current: number;
};

type ProgressCallback = (progress: Progress) => void;

export { Progress, ProgressCallback };
