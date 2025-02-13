import { PipelineStep } from './PipelineStep.js';
import { AppDataPath } from '../../config/AppDataPath.js';

export const getAppDataPathStep: PipelineStep<void, string> = () => {
  const appDataPathInstance = AppDataPath.getInstance();
  return appDataPathInstance.getAppDataPath();
};
