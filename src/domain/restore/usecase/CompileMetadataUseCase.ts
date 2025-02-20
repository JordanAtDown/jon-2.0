import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import { fold } from 'fp-ts/lib/Option.js';
import { Option, isSome, none, some } from 'fp-ts/lib/Option.js';
import {
  CategorySource,
  CheckpointDetails,
  DefaultCheckpointDataFileMetadata,
  resolveDefaultCheckpoint,
} from '../../sharedkernel/checkpoint/CheckpointData.js';
import FileMetadataRepository, {
  FilterFileMetadata,
} from '../FileMetadataRepository.js';
import { CompiledMetadataRepository } from '../CompiledMetadataRepository.js';
import TagsGenerator from '../../shared/tag/TagsGenerator.js';
import { CompileMetadataUseCaseCommand } from './CompileMetadataUseCaseCommand.js';
import ProgressTracker from '../../shared/tracker/ProgressTracker.js';
import FileMetadata from '../../sharedkernel/metadata/FileMetadata.js';
import { extractDate } from '../../shared/regex/ExtractDate.js';
import routes from '../../shared/regex/Routes.js';
import { ItemTrackerBuilder } from '../../shared/tracker/ItemTrackBuilder.js';
import CompiledMetadata from '../../sharedkernel/metadata/CompiledMetadata.js';
import CompiledDate from '../../sharedkernel/metadata/CompiledDate.js';
import { allPages } from '../../shared/utils/batch/GeneratePageNumbers.js';
import Checkpoint from '../../sharedkernel/checkpoint/Checkpoint.js';
import { DateTime } from 'luxon';
import DateGenerator from '../../shared/tag/DateGenerator.js';
import { ItemState, ItemTracker } from '../../shared/tracker/ItemTracker.js';
import WrapperMutableItemTracker from '../../shared/tracker/WrapperMutableItemTracker.js';
import WrapperMutableProgressTracker from '../../shared/tracker/WrapperMutableProgressTracker.js';
import { withLogTimingWithParams } from '../../shared/utils/fp/Log.js';
import { traverseArrayWithConcurrency } from '../../shared/utils/fp/FP.js';

export class CompileMetadataUseCase {
  constructor(
    private readonly fileMetadataRepository: FileMetadataRepository,
    private readonly compiledMetadataRepository: CompiledMetadataRepository,
    private readonly checkpoint: Checkpoint,
    private readonly tagsGenerator: TagsGenerator,
    private readonly dateGenerator: DateGenerator,
  ) {}

  /**
   * Compiles metadata by filtering, paginating, enriching with tags,
   * and saving the processed data into the compiled metadata repository.
   *
   * @param command - An instance of `CompileMetadataUseCaseCommand` containing the following parameters:
   *  - `idCheckpoint` (string): Identifier of checkpoint
   *  - `batchSize` (number): The size of each batch to be processed when iterating through pages.
   *  - `itemCallback` (function): A callback invoked during the processing of individual files.
   *  - `progressCallback` (function): A callback invoked to track the progress of the overall metadata compilation.
   *
   * @returns A TaskEither containing either an Error on failure or void on successful processing.
   */
  public compile = (
    command: CompileMetadataUseCaseCommand,
  ): TE.TaskEither<Error, void> => {
    return withLogTimingWithParams(
      'Compile Metadata',
      command,
      pipe(
        this.checkpoint.findBy(command.idCheckpoint),
        TE.chain((optionAggrCheckpoint) =>
          resolveDefaultCheckpoint(
            optionAggrCheckpoint,
            DefaultCheckpointDataFileMetadata,
            command.idCheckpoint,
          ),
        ),
        TE.chain((checkpointDetails: CheckpointDetails) =>
          pipe(
            this.fileMetadataRepository.getTotalBy({}, command.batchSize),
            TE.chain((numberPage) =>
              this.iteratePages(
                numberPage.totalPages,
                {},
                command.batchSize,
                checkpointDetails,
                new WrapperMutableItemTracker(
                  ItemTracker.init(command.itemCallback),
                ),
                new WrapperMutableProgressTracker(
                  ProgressTracker.init(
                    numberPage.totalItem - checkpointDetails.processed.size,
                    command.progressCallback,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  };

  private iteratePages(
    total: number,
    filter: FilterFileMetadata,
    pageSize: number,
    checkpointDetails: CheckpointDetails,
    itemTracker: WrapperMutableItemTracker,
    progressTracker: WrapperMutableProgressTracker,
  ): TE.TaskEither<Error, void> {
    return pipe(
      allPages(total),
      (pages) => {
        const maxConcurrency = 3;
        return traverseArrayWithConcurrency(pages, maxConcurrency, (page) =>
          this.processPage(
            page,
            filter,
            pageSize,
            itemTracker,
            progressTracker,
            checkpointDetails,
          ),
        );
      },
      TE.map(() => void 0),
    );
  }

  private processPage(
    page: number,
    filter: FilterFileMetadata,
    batchSize: number,
    itemTracker: WrapperMutableItemTracker,
    progressTracker: WrapperMutableProgressTracker,
    checkpoint: CheckpointDetails,
  ): TE.TaskEither<Error, void> {
    return pipe(
      this.fileMetadataRepository.getPageBy(page, filter, batchSize),
      TE.chain((fileMetadatas) => {
        const neverProcessFileMetadata = fileMetadatas.filter(
          (fileMetadata) => !checkpoint.processed.has(fileMetadata.fullPath),
        );

        return pipe(
          neverProcessFileMetadata,
          TE.traverseArray((fileMetadata) =>
            this.processMetadata(fileMetadata, itemTracker),
          ),
          TE.map((compiledFilesOptions) =>
            compiledFilesOptions.filter(isSome).map((o) => o.value),
          ),
          TE.chain((compiledFiles) => {
            return pipe(
              this.compiledMetadataRepository.saveAll(compiledFiles),
              TE.map((compiledFiles) => {
                return compiledFiles.map((file) => file.fullPath);
              }),
            );
          }),
          TE.chain((compiledFiles) => {
            return pipe(
              this.checkpoint.save({
                _id: checkpoint.id,
                category: CategorySource.ID,
                lastUpdate: DateTime.now(),
                processed: new Set(compiledFiles),
                source: checkpoint.source,
              }),
              TE.map(() => {
                progressTracker.increment();
              }),
            );
          }),
        );
      }),
    );
  }

  private processMetadata(
    fileMetadata: FileMetadata,
    itemTracker: WrapperMutableItemTracker,
  ): TE.TaskEither<Error, Option<CompiledMetadata>> {
    return pipe(
      fileMetadata.toCompiledDate(
        (name) => extractDate(routes, name),
        (name) => this.dateGenerator.generate(name),
      ),
      fold(
        () => {
          itemTracker.track(
            ItemTrackerBuilder.start()
              .withId(fileMetadata.fullPath)
              .asNormalItem(ItemState.UNPROCESS),
          );
          return TE.right(none);
        },
        (compiledDate: CompiledDate) => {
          return pipe(
            compiledDate.getYearMonth(),
            fold(
              () => {
                itemTracker.track(
                  ItemTrackerBuilder.start()
                    .withId(fileMetadata.fullPath)
                    .asNormalItem(ItemState.UNPROCESS),
                );
                return TE.right(none);
              },
              (yearMonth) => {
                itemTracker.track(
                  ItemTrackerBuilder.start()
                    .withId(fileMetadata.fullPath)
                    .asNormalItem(ItemState.PROCESS),
                );
                const compiledMetadata = new CompiledMetadata(
                  fileMetadata.fullPath,
                  fileMetadata.getTags((items) =>
                    this.tagsGenerator.generate(items),
                  ),
                  yearMonth.year,
                  yearMonth.month,
                  !!fileMetadata.exif,
                  compiledDate,
                  fileMetadata.extension,
                  fileMetadata.type!,
                );
                return TE.right(some(compiledMetadata));
              },
            ),
          );
        },
      ),
    );
  }
}

export default CompileMetadataUseCase;
