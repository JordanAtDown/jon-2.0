import LokiJSCheckpoint from '../../../../infra/sharedkernel/checkpoint/LokiJSCheckpoint.js';
import { PipelineStep } from '../../_step/PipelineStep.js';
import CopyAllFileWithCompileMetadataUseCase from '../../../../domain/catalog/usecase/CopyAllFileWithCompileMetadataUseCase.js';
import LokiJSMetadataRepository from '../../../../infra/catalog/LokiJSMetadataRepository.js';
import CopyAllFileWithCompileMetadataCommand from '../../../../domain/catalog/usecase/CopyAllFileWithCompileMetadataCommand.js';

export type ExtractMetadataDependencies = {
  checkpointRepository: LokiJSCheckpoint;
  metadataRepository: LokiJSMetadataRepository;
};
export const copyAllStep =
  (
    dependencies: ExtractMetadataDependencies,
    command: CopyAllFileWithCompileMetadataCommand,
  ): PipelineStep<void, void> =>
  () =>
    new CopyAllFileWithCompileMetadataUseCase(
      dependencies.metadataRepository,
      dependencies.checkpointRepository,
    ).copyAllFiles(command);
