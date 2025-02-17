import LokiJSCheckpoint from '../../../../infra/sharedkernel/checkpoint/LokiJSCheckpoint.js';
import { PipelineStep } from '../../_step/PipelineStep.js';
import MergeDuplicateCommand from '../../../../domain/duplicate/usecase/MergeDuplicateCommand.js';
import MergeDuplicateUseCase from '../../../../domain/duplicate/usecase/MergeDuplicateUseCase.js';

export type MergeDependencies = {
  checkpointRepository: LokiJSCheckpoint;
};
export const mergeStep =
  (
    dependencies: MergeDependencies,
    command: MergeDuplicateCommand,
  ): PipelineStep<void, void> =>
  () =>
    new MergeDuplicateUseCase(dependencies.checkpointRepository).withCommand(
      command,
    );
