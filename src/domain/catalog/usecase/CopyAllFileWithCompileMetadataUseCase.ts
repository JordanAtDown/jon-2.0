import * as TE from 'fp-ts/lib/TaskEither.js';
import * as A from 'fp-ts/lib/Array.js';
import { pipe } from 'fp-ts/lib/function.js';
import MetadataRepository, {
  FilterCompiledMetadata,
} from '../MetadataRepository.js';
import CompiledMetadata from '../../sharedkernel/metadata/CompiledMetadata.js';
import CopyAllFileWithCompileMetadataCommand from './CopyAllFileWithCompileMetadataCommand.js';
import Checkpoint from '../../sharedkernel/checkpoint/Checkpoint.js';
import buildFilenameWithFormat from '../../shared/filesystem/BuildFilenameWithFormat.js';
import { buildDirectoryPath } from '../../shared/filesystem/BuildDirectoryPath.js';
import { ExifPropertyBuilder } from '../../shared/exif/ExifProperty.js';
import {
  validateDateTime,
  validateKeywords,
} from '../../shared/exif/validation/Validations.js';
import {
  CategorySource,
  CheckpointDetails,
  DefaultCheckpointDataCompiledMetadata,
  resolveDefaultCheckpoint,
} from '../../sharedkernel/checkpoint/CheckpointData.js';
import { DateTime } from 'luxon';
import { filesystemApply } from '../../shared/filesystem/FilesystemApply.js';
import { isNone } from 'fp-ts/lib/Option.js';
import { NumberPage } from '../../../tests/infra/utils/LokiJSBaseRepository.js';
import { allPages } from '../../shared/utils/batch/GeneratePageNumbers.js';
import { withLogTimingWithParams } from '../../shared/utils/fp/Log.js';

class CopyAllFileWithCompileMetadataUseCase {
  constructor(
    private readonly compiledMetadataRepository: MetadataRepository,
    private readonly checkpoint: Checkpoint,
  ) {
    this.compiledMetadataRepository = compiledMetadataRepository;
  }

  public copyAllFiles = (
    command: CopyAllFileWithCompileMetadataCommand,
  ): TE.TaskEither<Error, void> =>
    withLogTimingWithParams(
      'Copy All Files with Compile Metadata',
      command,
      pipe(
        this.checkpoint.findBy(command.idCheckpoint),
        TE.chain((optionAggrCheckpoint) =>
          resolveDefaultCheckpoint(
            optionAggrCheckpoint,
            DefaultCheckpointDataCompiledMetadata,
            command.idCheckpoint,
          ),
        ),
        TE.chain((checkpointDetails: CheckpointDetails) =>
          pipe(
            this.compiledMetadataRepository.getTotalBy({}, command.batchSize),
            TE.chain((numberPage) =>
              this.iteratePages(
                command.destinationDir,
                numberPage,
                {},
                command.batchSize,
                checkpointDetails,
              ),
            ),
          ),
        ),
      ),
    );

  private iteratePages(
    destinationDir: string,
    numberPage: NumberPage,
    filter: FilterCompiledMetadata,
    pageSize: number,
    checkpointDetails: CheckpointDetails,
  ): TE.TaskEither<Error, void> {
    return pipe(
      allPages(numberPage.totalPages),
      TE.traverseArray((page) =>
        this.processPage(
          destinationDir,
          filter,
          page,
          pageSize,
          checkpointDetails,
        ),
      ),
      TE.map(() => void 0),
    );
  }

  private processPage = (
    destinationDir: string,
    filter: FilterCompiledMetadata,
    pageNumber: number,
    batchSize: number,
    checkpointDetails: CheckpointDetails,
  ): TE.TaskEither<Error, void> => {
    return pipe(
      this.compiledMetadataRepository.getPageBy(filter, pageNumber, batchSize),
      TE.map((compiledMetadatas) =>
        compiledMetadatas.filter(
          (metadata) => !checkpointDetails.processed.has(metadata.fullPath),
        ),
      ),

      TE.chain((compiledMetadatas) => {
        return this.processAllMetadatas(
          destinationDir,
          compiledMetadatas,
          checkpointDetails,
        );
      }),
    );
  };

  private processAllMetadatas = (
    destinationDir: string,
    metadatas: CompiledMetadata[],
    checkpointDetails: CheckpointDetails,
  ): TE.TaskEither<Error, void> => {
    return pipe(
      metadatas,
      A.map((metadata) => {
        const date = metadata.date.getDate();

        if (isNone(date)) {
          return TE.right(void 0);
        }

        const filename = buildFilenameWithFormat(
          date.value,
          metadata.extension,
          metadata.type,
        );
        const destinationPath = buildDirectoryPath(
          destinationDir,
          {
            date: date.value,
            type: metadata.type,
            extension: metadata.extension,
          },
          filename,
        );

        const dateTimeOriginalProperty = new ExifPropertyBuilder<string>(
          'DateTimeOriginal',
        )
          .withValueGetter(() => date.value.toString())
          .withValidator(validateDateTime)
          .withErrorMessage(`invalid for ${destinationPath}`)
          .build();
        const keywordsProperty = new ExifPropertyBuilder<string[]>('Keywords')
          .withValueGetter(() => Array.from(metadata.tags))
          .withValidator(validateKeywords)
          .withErrorMessage(`invalid for ${destinationPath}`)
          .build();
        const exifProperties = [keywordsProperty, dateTimeOriginalProperty];

        const fileSystemApplyCommand = {
          filepath: metadata.fullPath,
          destPath: destinationPath,
          exifProperties: exifProperties,
        };
        return pipe(
          filesystemApply(fileSystemApplyCommand),
          TE.chain(() => {
            return pipe(
              this.checkpoint.save({
                _id: checkpointDetails.id,
                category: CategorySource.ID,
                lastUpdate: DateTime.now(),
                processed: new Set([metadata.fullPath]),
                source: checkpointDetails.source,
              }),
              TE.map(() => {
                void 0;
              }),
            );
          }),
        );
      }),
      TE.sequenceSeqArray,
      TE.map(() => void 0),
    );
  };
}

export default CopyAllFileWithCompileMetadataUseCase;
