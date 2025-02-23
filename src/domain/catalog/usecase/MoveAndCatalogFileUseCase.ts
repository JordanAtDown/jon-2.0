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
import {
  fileMovedOnly,
  filesystemApply,
} from '../../shared/filesystem/FilesystemApply.js';
import FileScanner from '../../shared/filesystem/FileScanner.js';
import Extractor from '../../shared/extractor/Extractor.js';
import compositeExtractor from '../../shared/extractor/CompositeExtractor.js';
import buildFilenameWithFormat from '../../shared/filesystem/BuildFilenameWithFormat.js';
import { withLogTimingWithParams } from '../../shared/utils/fp/Log.js';

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
    withLogTimingWithParams(
      'Move and Catalog Files',
      command,
      pipe(
        this.fileScanner.scanFiles(
          command.rootDirectory,
          buildPatterns(command.extensions),
        ),
        TE.chain((files) => {
          return this.processBatches(
            batchArray(files, command.batchSize),
            command.destinationDirectory,
          );
        }),
      ),
    );

  private extractFilepath = (
    filePath: string,
  ): TE.TaskEither<Error, Option<FileMetadata>> =>
    pipe(
      TE.fromTask(
        safeExtract(
          compositeExtractor([DateTimeOriginal, ...this.extractors]),
          filePath,
        ),
      ),
      TE.map((optionFileMetadata: Option<FileMetadata>) =>
        pipe(
          optionFileMetadata,
          O.fold(
            () => {
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
  ): TE.TaskEither<Error, void> => {
    return pipe(
      optionFilemetadas,
      A.filterMap((optionFileMetadata) => optionFileMetadata),
      (fileMetadatas) =>
        this.processEnrichedMetadataBatch(fileMetadatas, destDir),
    );
  };

  private processBatches = (
    batches: string[][],
    destDir: string,
  ): TE.TaskEither<Error, void> =>
    pipe(
      batches,
      TE.traverseSeqArray((batch) =>
        pipe(
          batch,
          A.map((filePath) => this.extractFilepath(filePath)),
          TE.sequenceArray,
          TE.chain((optionFileMetadatas) =>
            this.filterAndEnrichMetadas(
              Array.from(optionFileMetadatas),
              destDir,
            ),
          ),
        ),
      ),
      TE.map(() => void 0),
    );

  private processEnrichedMetadataBatch = (
    fileMetadatas: FileMetadata[],
    destDir: string,
  ): TE.TaskEither<Error, void> =>
    pipe(
      fileMetadatas,
      A.map((fileMetadata) =>
        pipe(
          fileMetadata.enrichWithDate((name) => extractDate(routes, name)),
          O.fold(
            () => {
              return TE.of(void 0);
            },
            (fileMetadataEnrichWithDate) => {
              return this.processSingleFile(
                fileMetadataEnrichWithDate,
                destDir,
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
    };

    if (!!metadata.exif) {
      return pipe(
        filesystemApply(command),
        TE.map(() => void 0),
      );
    } else {
      return pipe(
        fileMovedOnly(command),
        TE.map(() => void 0),
      );
    }
  };
}

export default MoveAndCatalogFileUseCase;
