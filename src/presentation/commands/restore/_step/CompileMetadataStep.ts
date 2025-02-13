import LokiJSFileMetadataRepository from '../../../../infra/restore/LokiJSFileMetadataRepository.js';
import LokiJSCompiledMetadataRepository from '../../../../infra/restore/LokiJSCompiledMetadataRepository.js';
import LokiJSCheckpoint from '../../../../infra/sharedkernel/checkpoint/LokiJSCheckpoint.js';
import HashTagGenerator from '../../../../infra/shared/tag/HashTagGenerator.js';
import HashDateGenerator from '../../../../infra/shared/tag/HashDateGenerator.js';
import { CompileMetadataUseCaseCommand } from '../../../../domain/restore/usecase/CompileMetadataUseCaseCommand.js';
import { PipelineStep } from '../../_step/PipelineStep.js';
import CompileMetadataUseCase from '../../../../domain/restore/usecase/CompileMetadataUseCase.js';

export type CompileMetadataDependencies = {
  fileMetadataRepository: LokiJSFileMetadataRepository;
  compiledMetadataRepository: LokiJSCompiledMetadataRepository;
  checkpointRepository: LokiJSCheckpoint;
  tagsGenerator: HashTagGenerator;
  dateGenerator: HashDateGenerator;
};

export const CompileMetadataStep =
  (
    dependencies: CompileMetadataDependencies,
    command: CompileMetadataUseCaseCommand,
  ): PipelineStep<void, void> =>
  () =>
    new CompileMetadataUseCase(
      dependencies.fileMetadataRepository,
      dependencies.compiledMetadataRepository,
      dependencies.checkpointRepository,
      dependencies.tagsGenerator,
      dependencies.dateGenerator,
    ).compile(command);
