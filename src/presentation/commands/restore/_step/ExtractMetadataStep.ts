import ExtractFileMetadataCommand from '../../../../domain/restore/usecase/ExtractFileMetadataCommand.js';
import LokiJSFileMetadataRepository from '../../../../infra/restore/LokiJSFileMetadataRepository.js';
import LokiJSCheckpoint from '../../../../infra/sharedkernel/checkpoint/LokiJSCheckpoint.js';
import { PipelineStep } from '../../_step/PipelineStep.js';
import ExtractFileMetadataUseCase from '../../../../domain/restore/usecase/ExtractFileMetadataUseCase.js';
import fastGlobScanner from '../../../../infra/shared/filesystem/FastGlobScanner.js';
import DateTimeOriginal from '../../../../domain/shared/extractor/DateTimeOriginal.js';

export type ExtractMetadataDependencies = {
  checkpointRepository: LokiJSCheckpoint;
  fileMetadataRepository: LokiJSFileMetadataRepository;
};
export const ExtractMetadataStep =
  (
    dependencies: ExtractMetadataDependencies,
    command: ExtractFileMetadataCommand,
  ): PipelineStep<void, void> =>
  () =>
    new ExtractFileMetadataUseCase(
      fastGlobScanner,
      dependencies.checkpointRepository,
      [DateTimeOriginal],
      dependencies.fileMetadataRepository,
    ).extractFileMetadata(command);
