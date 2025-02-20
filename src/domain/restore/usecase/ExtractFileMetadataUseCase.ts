import * as TE from 'fp-ts/lib/TaskEither.js';
import * as O from 'fp-ts/lib/Option.js';
import { fold, Option, isSome } from 'fp-ts/lib/Option.js';
import { pipe } from 'fp-ts/lib/function.js';
import FileMetadataRepository from '../FileMetadataRepository.js';
import ExtractFileMetadataCommand from './ExtractFileMetadataCommand.js';
import { filterItems } from '../../shared/utils/fp/FP.js';
import FileMetadata from '../../sharedkernel/metadata/FileMetadata.js';
import safeExtract from '../../shared/extractor/SafeExtract.js';
import compositeExtractor from '../../shared/extractor/CompositeExtractor.js';
import Checkpoint from '../../sharedkernel/checkpoint/Checkpoint.js';
import { DateTime } from 'luxon';
import {
  CategorySource,
  DefaultCheckpointDataFileMetadata,
  resolveDefaultCheckpoint,
} from '../../sharedkernel/checkpoint/CheckpointData.js';
import FileScanner from '../../shared/filesystem/FileScanner.js';
import Extractor from '../../shared/extractor/Extractor.js';
import { batchArray } from '../../shared/utils/batch/BatchArray.js';
import buildPatterns from '../../shared/filesystem/BuildPattern.js';
import { withLogTimingWithParams } from '../../shared/utils/fp/Log.js';

export class ExtractFileMetadataUseCase {
  constructor(
    private readonly fileScanner: FileScanner,
    private readonly checkpoint: Checkpoint,
    private readonly extractors: Extractor[],
    private readonly fileMetadataRepository: FileMetadataRepository,
  ) {
    this.fileScanner = fileScanner;
    this.checkpoint = checkpoint;
    this.extractors = extractors;
    this.fileMetadataRepository = fileMetadataRepository;
  }

  /**
   * Catalog files in batches and extract metadata for each batch.
   *
   * @param command - command for extraction
   * @returns A TaskEither containing either an error or the list of batches with enriched file metadata.
   */
  public extractFileMetadata = (
    command: ExtractFileMetadataCommand,
  ): TE.TaskEither<Error, void> => {
    return withLogTimingWithParams(
      'Extract File Metadata',
      command,
      pipe(
        this.scanAndFilterFiles(
          command.rootDirectory,
          command.extensions,
          command.idCheckpoint,
        ),
        TE.map((files) => {
          const batches = batchArray(files, command.batchSize);
          return { batches };
        }),
        TE.chain(({ batches }) =>
          this.processBatches(
            batches,
            command.idCheckpoint,
            command.rootDirectory,
          ),
        ),
      ),
    );
  };

  /**
   * Scans the directory and filters out already processed files.
   *
   * @param rootDirectory - The directory to scan.
   * @param extensions - File extensions to look for.
   * @param idCheckpoint - Identifier of checkpoint
   * @returns A TaskEither containing either an error or the unprocessed files.
   */
  private scanAndFilterFiles = (
    rootDirectory: string,
    extensions: string[],
    idCheckpoint: string,
  ): TE.TaskEither<Error, string[]> =>
    pipe(
      this.fileScanner.scanFiles(rootDirectory, buildPatterns(extensions)),
      TE.chain(this.filterProcessedFiles(idCheckpoint)),
    );

  /**
   * Filters out already processed files based on checkpoint data.
   *
   * @param idCheckpoint - Identifier of checkpoint
   * @returns A function that takes a list of all files and returns a TaskEither with unprocessed files.
   */
  private filterProcessedFiles =
    (idCheckpoint: string) =>
    (allFiles: string[]): TE.TaskEither<Error, string[]> =>
      pipe(
        this.checkpoint.findBy(idCheckpoint),
        TE.chain((optionCheckpoint) =>
          resolveDefaultCheckpoint(
            optionCheckpoint,
            DefaultCheckpointDataFileMetadata,
            idCheckpoint,
          ),
        ),
        TE.map((checkpointDetails) => {
          const processedFiles = Array.from(checkpointDetails.processed);
          return filterItems(allFiles, processedFiles);
        }),
      );

  private processBatches = (
    batches: string[][],
    idCheckpoint: string,
    rootDir: string,
  ): TE.TaskEither<Error, void> => {
    return pipe(
      TE.traverseArray((batch: string[]) =>
        this.processBatch(batch, rootDir, idCheckpoint),
      )(batches),
      TE.map(() => void 0),
    );
  };

  private processBatch = (
    batch: string[],
    rootDir: string,
    idCheckpoint: string,
  ): TE.TaskEither<Error, void> => {
    return pipe(
      batch,
      TE.traverseArray((file) => this.processFile(file)),
      TE.map((fileMetadatOptions) =>
        fileMetadatOptions.filter(isSome).map((o) => o.value),
      ),
      TE.chain((fileMetadata) => {
        return pipe(
          this.fileMetadataRepository.saveAll(fileMetadata),
          TE.map((compiledFiles) => {
            return compiledFiles.map((file) => file.fullPath);
          }),
        );
      }),
      TE.chain((ids) =>
        TE.fromTask(() =>
          this.checkpoint.save({
            _id: idCheckpoint,
            processed: new Set(Array.from(ids)),
            lastUpdate: DateTime.now(),
            source: rootDir,
            category: CategorySource.Dir,
          })(),
        ),
      ),
      TE.map(() => void 0),
    );
  };

  private processFile = (
    filePath: string,
  ): TE.TaskEither<Error, Option<FileMetadata>> => {
    return pipe(
      safeExtract(compositeExtractor(this.extractors), filePath),
      TE.fromTask,
      TE.chain(
        fold(
          () => {
            return TE.right(O.none);
          },
          (fileMetadata) => {
            return TE.right(O.some(fileMetadata));
          },
        ),
      ),
    );
  };
}

export default ExtractFileMetadataUseCase;
