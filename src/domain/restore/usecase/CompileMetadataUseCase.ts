import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { fold } from 'fp-ts/Option';
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
import DateGenerator from 'domain/shared/tag/DateGenerator.js';
import TagsGenerator from '../../shared/tag/TagsGenerator.js';
import { CompileMetadataUseCaseCommand } from './CompileMetadataUseCaseCommand.js';
import { ItemState, ItemTracker } from 'domain/shared/tracker/ItemTracker.js';
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

class CompileMetadataUseCase {
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
  public compile(
    command: CompileMetadataUseCaseCommand,
  ): TE.TaskEither<Error, void> {
    return pipe(
      this.checkpoint.findBy(command.idCheckpoint),
      TE.chain((optionAggrCheckpoint) =>
        resolveDefaultCheckpoint(
          optionAggrCheckpoint,
          DefaultCheckpointDataFileMetadata,
        ),
      ),
      TE.chain((checkpointDetails: CheckpointDetails) =>
        pipe(
          this.fileMetadataRepository.getTotalBy({}, command.batchSize),
          TE.chain((total) =>
            this.iteratePages(
              total,
              {},
              command.batchSize,
              checkpointDetails,
              ItemTracker.init(command.itemCallback),
              ProgressTracker.init(total, command.progressCallback),
            ),
          ),
        ),
      ),
    );
  }

  private iteratePages(
    total: number,
    filter: FilterFileMetadata,
    pageSize: number,
    checkpointDetails: CheckpointDetails,
    itemTracker: ItemTracker,
    progressTracker: ProgressTracker,
  ): TE.TaskEither<Error, void> {
    return pipe(
      allPages(total),
      TE.traverseArray((page) =>
        this.processPage(
          page,
          filter,
          pageSize,
          itemTracker,
          progressTracker,
          checkpointDetails,
        ),
      ),
      TE.map(() => void 0),
    );
  }

  private processPage(
    page: number,
    filter: FilterFileMetadata,
    batchSize: number,
    itemTracker: ItemTracker,
    progressTracker: ProgressTracker,
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
    itemTracker: ItemTracker,
  ): TE.TaskEither<Error, string> {
    return pipe(
      fileMetadata.toCompiledDate(
        (name) => extractDate(routes, name),
        (name) => this.dateGenerator.generate(name),
      ),
      fold(
        () => {
          itemTracker.track(
            ItemTrackerBuilder.start()
              .withId('') // TODO: Lien manquant
              .asNormalItem(ItemState.UNPROCESS),
          );
          return TE.right('');
        },
        (compiledDate: CompiledDate) => {
          return pipe(
            compiledDate.getYearMonth(),
            fold(
              () => {
                itemTracker.track(
                  ItemTrackerBuilder.start()
                    .withId('') // TODO: Lien manquant
                    .asNormalItem(ItemState.UNPROCESS),
                );
                return TE.right('');
              },
              (yearMonth) => {
                return pipe(
                  this.compiledMetadataRepository.save(
                    new CompiledMetadata(
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
                    ),
                  ),
                  TE.map(() => {
                    itemTracker.track(
                      ItemTrackerBuilder.start()
                        .withId(fileMetadata.fullPath)
                        .asNormalItem(ItemState.PROCESS),
                    );
                    return fileMetadata.fullPath;
                  }),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

export default CompileMetadataUseCase;
