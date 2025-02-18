import * as TE from 'fp-ts/lib/TaskEither.js';
import * as A from 'fp-ts/lib/Array.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as O from 'fp-ts/lib/Option.js';
import { Option } from 'fp-ts/lib/Option.js';
import MoveAndCatalogFileCommand from './MoveAndCatalogFileCommand.js';
import buildPatterns from '../../shared/filesystem/BuildPattern.js';
import { batchArray } from '../../shared/utils/batch/BatchArray.js';
import safeExtract from '../../shared/extractor/SafeExtract.js';
import FileMetadata from '../../sharedkernel/metadata/FileMetadata.js';
import { extractDate } from '../../shared/regex/ExtractDate.js';
import routes from '../../shared/regex/Routes.js';
import DateMetadata from '../../sharedkernel/metadata/DateMetadata.js';
import { buildDirectoryPath } from '../../shared/filesystem/BuildDirectoryPath.js';
import { ExifPropertyBuilder } from '../../shared/exif/ExifProperty.js';
import { validateDateTime } from '../../shared/exif/validation/Validations.js';
import DateTimeOriginal from '../../shared/extractor/DateTimeOriginal.js';
import { filesystemApply } from '../../shared/filesystem/FilesystemApply.js';
import { ItemTrackerBuilder } from '../../shared/tracker/ItemTrackBuilder.js';
import FileScanner from '../../shared/filesystem/FileScanner.js';
import Extractor from '../../shared/extractor/Extractor.js';
import ProgressTracker from '../../shared/tracker/ProgressTracker.js';
import { ItemState, ItemTracker } from '../../shared/tracker/ItemTracker.js';
import compositeExtractor from '../../shared/extractor/CompositeExtractor.js';
import buildFilenameWithFormat from '../../shared/filesystem/BuildFilenameWithFormat.js';
import WrapperMutableProgressTracker from '../../shared/tracker/WrapperMutableProgressTracker.js';
import WrapperMutableItemTracker from '../../shared/tracker/WrapperMutableItemTracker.js';

export class MoveAndCatalogFileUseCase {
  constructor(
    private readonly fileScanner: FileScanner,
    private readonly extractors: Extractor[],
  ) {}

  /**
   * Scans a source directory, processes the files to extract their metadata,
   * sorts them, renames them, and moves them to an organized destination directory.
   *
   * @param command - An instance of `MoveAndCatalogFileCommand` containing:
   *   - `rootDirectory`: Path of the source directory to scan.
   *   - `extensions`: List of file extensions to include in the scan.
   *   - `batchSize`: Batch size for batch processing.
   *   - `destinationDirectory`: Path to the directory organizing the files.
   *   - `progress`: A callback for progress tracking.
   *
   * @returns TE.TaskEither<Error, void> :
   *   - Left: An instance of Error in case of failure.
   *   - Right: `void` in case of success.
   */
  public moveAndCatalogFile = (
    command: MoveAndCatalogFileCommand,
  ): TE.TaskEither<Error, void> =>
    pipe(
      this.fileScanner.scanFiles(
        command.rootDirectory,
        buildPatterns(command.extensions),
      ),
      TE.chain((files) => {
        return this.processBatches(
          batchArray(files, command.batchSize),
          command.destinationDirectory,
          new WrapperMutableProgressTracker(
            ProgressTracker.init(files.length, command.progress),
          ),
          new WrapperMutableItemTracker(ItemTracker.init(command.itemCallback)),
        );
      }),
    );

  private extractFilepath = (
    filePath: string,
    itemTracker: WrapperMutableItemTracker,
  ): TE.TaskEither<Error, Option<FileMetadata>> =>
    pipe(
      TE.fromTask(
        safeExtract(
          compositeExtractor([DateTimeOriginal, ...this.extractors]),
          filePath,
          itemTracker,
        ),
      ),
      TE.map((optionFileMetadata: Option<FileMetadata>) =>
        pipe(
          optionFileMetadata,
          O.fold(
            () => {
              itemTracker.track(
                ItemTrackerBuilder.start()
                  .withId(filePath)
                  .asNormalItem(ItemState.UNPROCESS),
              );
              return O.none;
            },
            (metadata) => O.some(metadata),
          ),
        ),
      ),
    );

  private filterAndEnrichMetadas = (
    optionFilemetadas: Option<FileMetadata>[],
    destDir: string,
    progressTracker: WrapperMutableProgressTracker,
    itemTracker: WrapperMutableItemTracker,
  ): TE.TaskEither<Error, void> => {
    return pipe(
      optionFilemetadas,
      A.filterMap((optionFileMetadata) => optionFileMetadata),
      (fileMetadatas) =>
        this.processEnrichedMetadataBatch(
          fileMetadatas,
          destDir,
          progressTracker,
          itemTracker,
        ),
    );
  };

  private processBatches = (
    batches: string[][],
    destDir: string,
    progressTracker: WrapperMutableProgressTracker,
    itemTracker: WrapperMutableItemTracker,
  ): TE.TaskEither<Error, void> =>
    pipe(
      batches,
      TE.traverseArray((batch) =>
        pipe(
          batch,
          A.map((filePath) => this.extractFilepath(filePath, itemTracker)),
          TE.sequenceArray,
          TE.chain((optionFileMetadatas) =>
            this.filterAndEnrichMetadas(
              Array.from(optionFileMetadatas),
              destDir,
              progressTracker,
              itemTracker,
            ),
          ),
        ),
      ),
      TE.map(() => void 0),
    );

  private processEnrichedMetadataBatch = (
    fileMetadatas: FileMetadata[],
    destDir: string,
    progressTracker: WrapperMutableProgressTracker,
    itemTracker: WrapperMutableItemTracker,
  ): TE.TaskEither<Error, void> =>
    pipe(
      fileMetadatas,
      A.map((fileMetadata) =>
        pipe(
          fileMetadata.enrichWithDate((name) => extractDate(routes, name)),
          O.fold(
            () => {
              itemTracker.track(
                ItemTrackerBuilder.start()
                  .withId(fileMetadata.fullPath)
                  .asNormalItem(ItemState.UNPROCESS),
              );
              return TE.of(void 0);
            },
            (fileMetadataEnrichWithDate) => {
              return this.processSingleFile(
                fileMetadataEnrichWithDate,
                destDir,
                progressTracker,
                itemTracker,
              );
            },
          ),
        ),
      ),
      TE.sequenceArray,
      TE.map(() => void 0),
    );

  private processSingleFile = (
    metadata: DateMetadata,
    destDir: string,
    tracker: WrapperMutableProgressTracker,
    itemTracker: WrapperMutableItemTracker,
  ): TE.TaskEither<Error, void> => {
    const destinationDirPath = buildDirectoryPath(
      destDir,
      metadata.date,
      buildFilenameWithFormat(metadata.date, metadata.extension, metadata.type),
    );
    const dateTimeOriginalProperty = new ExifPropertyBuilder<string>(
      'DateTimeOriginal',
    )
      .withValueGetter(() => metadata.date.toString())
      .withValidator(validateDateTime)
      .withErrorMessage(`invalid for ${destinationDirPath}`)
      .build();
    const command = {
      filepath: metadata.fullPath,
      destPath: destinationDirPath,
      exifProperties: Array.of(dateTimeOriginalProperty),
      itemTracker: itemTracker,
    };

    return pipe(
      filesystemApply(command),
      TE.chain(() => TE.fromIO(() => tracker.increment())),
      TE.map(() => void 0),
    );
  };
}

export default MoveAndCatalogFileUseCase;
