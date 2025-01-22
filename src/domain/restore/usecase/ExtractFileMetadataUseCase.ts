import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import FileScanner from '../../shared/filesystem/FileScanner';
import FileMetadataRepository from '../FileMetadataRepository';
import { fold } from 'fp-ts/Option';
import FileMetadata from '../FileMetadata';
import { batchArray } from '../../shared/utils/batch/BatchArray';
import buildPatterns from '../../shared/filesystem/BuildPattern';
import { filterItems } from '../../shared/utils/fp/FP';
import Extractor from '../../shared/extractor/Extractor';
import compositeExtractor from '../../shared/extractor/CompositeExtractor';
import Checkpoint from '../../sharedkernel/checkpoint/Checkpoint';
import ExtractFileMetadataCommand from './ExtractFileMetadataCommand';
import ProgressTracker from '../../shared/tracker/ProgressTracker';

class ExtractFileMetadataUseCase {
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
  ): TE.TaskEither<Error, FileMetadata[][]> =>
    pipe(
      this.scanAndFilterFiles(
        command.rootDirectory,
        command.extensions,
        command.idCheckpoint,
      ),
      TE.map((files) => {
        const tracker = ProgressTracker.init(files.length, command.progress);
        const batches = batchArray(files, command.batchSize);
        return { batches, tracker };
      }),
      TE.chain(({ batches, tracker }) =>
        this.processBatches(batches, tracker, command.idCheckpoint)(),
      ),
    );

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
        TE.map(
          fold(
            () => [],
            (checkpointData) => checkpointData.processed,
          ),
        ),
        TE.map((processedFiles) => filterItems(allFiles, processedFiles)),
      );

  /**
   * Processes and extracts metadata for each batch of files.
   *
   * @param batches - Batches of file paths to be processed.
   * @param tracker - Instance of ProgressTracker to track progress as each file is processed.
   * @param idCheckpoint - updating checkpoint after each batch
   * @returns A function that takes a list of batches and processes them with metadata extraction and saving.
   */
  private processBatches =
    (batches: string[][], tracker: ProgressTracker, idCheckpoint: string) =>
    (): TE.TaskEither<Error, FileMetadata[][]> =>
      pipe(
        TE.sequenceArray(
          batches.map((batch) =>
            pipe(
              TE.sequenceArray<FileMetadata, Error>(
                batch.map((filePath) =>
                  pipe(
                    compositeExtractor(this.extractors)(filePath),
                    TE.chain((metadata) =>
                      pipe(
                        this.fileMetadataRepository.save(metadata),
                        TE.map(() => {
                          tracker = tracker.increment();
                          return metadata;
                        }),
                      ),
                    ),
                  ),
                ),
              ),
              TE.chain((readonlyBatch) =>
                pipe(
                  this.checkpoint.update(idCheckpoint, new Set(batch)),
                  TE.map(() => [...readonlyBatch]),
                ),
              ),
            ),
          ),
        ),
        TE.map((readonlyBatches) => readonlyBatches.map((batch) => [...batch])),
      );
}

export default ExtractFileMetadataUseCase;
