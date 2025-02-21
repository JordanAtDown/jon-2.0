import HashTagGenerator from '../../../../infra/shared/tag/HashTagGenerator.js';
import { PipelineStep } from '../../_step/PipelineStep.js';
import {
  ApplyTagsDictionaryCommand,
  ApplyTagsDictionaryUseCase,
} from '../../../../domain/restore/usecase/ApplyTagsDictionaryUseCase.js';
import fastGlobScanner from '../../../../infra/shared/filesystem/FastGlobScanner.js';

export type CompileMetadataDependencies = {
  tagsGenerator: HashTagGenerator;
};

export const applyTagsStep =
  (
    dependencies: CompileMetadataDependencies,
    command: ApplyTagsDictionaryCommand,
  ): PipelineStep<void, void> =>
  () =>
    new ApplyTagsDictionaryUseCase(
      fastGlobScanner,
      dependencies.tagsGenerator,
    ).withInput(command);
