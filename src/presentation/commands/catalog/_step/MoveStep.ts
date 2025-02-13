import { PipelineStep } from '../../_step/PipelineStep.js';
import fastGlobScanner from '../../../../infra/shared/filesystem/FastGlobScanner.js';
import DateTimeOriginal from '../../../../domain/shared/extractor/DateTimeOriginal.js';
import MoveAndCatalogFileUseCase from '../../../../domain/catalog/usecase/MoveAndCatalogFileUseCase.js';
import MoveAndCatalogFileCommand from '../../../../domain/catalog/usecase/MoveAndCatalogFileCommand.js';

export const moveStep =
  (command: MoveAndCatalogFileCommand): PipelineStep<void, void> =>
  () =>
    new MoveAndCatalogFileUseCase(fastGlobScanner, [
      DateTimeOriginal,
    ]).moveAndCatalogFile(command);
