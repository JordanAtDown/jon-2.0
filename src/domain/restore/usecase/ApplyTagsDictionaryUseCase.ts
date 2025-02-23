import TagsGenerator from '../../shared/tag/TagsGenerator.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as O from 'fp-ts/lib/Option.js';
import { fold, Option, isSome } from 'fp-ts/lib/Option.js';
import FileScanner from '../../shared/filesystem/FileScanner.js';
import { withLogTimingWithParams } from '../../shared/utils/fp/Log.js';
import { batchArray } from '../../shared/utils/batch/BatchArray.js';
import buildPatterns from '../../shared/filesystem/BuildPattern.js';
import FileMetadata from '../../sharedkernel/metadata/FileMetadata.js';
import safeExtract from '../../shared/extractor/SafeExtract.js';
import compositeExtractor from '../../shared/extractor/CompositeExtractor.js';
import { ExifPropertyBuilder } from '../../shared/exif/ExifProperty.js';
import { validateKeywords } from '../../shared/exif/validation/Validations.js';
import { onlyExifApply } from '../../shared/filesystem/FilesystemApply.js';

export type ApplyTagsDictionaryCommand = {
  rootDirectory: string;
  extensions: string[];
  batchSize: number;
};

export class ApplyTagsDictionaryUseCase {
  constructor(
    private readonly fileScanner: FileScanner,
    private readonly tagsGenerator: TagsGenerator,
  ) {
    this.tagsGenerator = tagsGenerator;
    this.fileScanner = fileScanner;
  }

  public withInput = (
    command: ApplyTagsDictionaryCommand,
  ): TE.TaskEither<Error, void> => {
    return withLogTimingWithParams(
      'Apply Tags Dictionary',
      command,
      pipe(
        this.fileScanner.scanFiles(
          command.rootDirectory,
          buildPatterns(command.extensions),
        ),
        TE.map((files) => {
          const batches = batchArray(files, command.batchSize);
          return { batches };
        }),
        TE.chain(({ batches }) => this.processBatches(batches)),
      ),
    );
  };

  private processBatches = (
    batches: string[][],
  ): TE.TaskEither<Error, void> => {
    return pipe(
      TE.traverseSeqArray((batch: string[]) => this.processBatch(batch))(
        batches,
      ),
      TE.map(() => void 0),
    );
  };

  private processBatch = (batch: string[]): TE.TaskEither<Error, void> => {
    return pipe(
      batch,
      TE.traverseArray((file) => this.extract(file)),
      TE.map((fileMetadatOptions) =>
        fileMetadatOptions.filter(isSome).map((o) => o.value),
      ),
      TE.chain((fileMetadataList) => {
        return pipe(
          TE.traverseArray((fileMetadata: FileMetadata) => {
            return pipe(
              TE.of(
                fileMetadata.getTags((items) =>
                  this.tagsGenerator.generate(items),
                ),
              ),
              TE.map((tags) => {
                if (fileMetadata.type === 'VIDEO') {
                  const keywordsProperty = new ExifPropertyBuilder<string[]>(
                    'XMP:Subject',
                  )
                    .withValueGetter(() => Array.from(tags))
                    .withValidator(validateKeywords)
                    .withErrorMessage(`Invalid for ${fileMetadata.fullPath}`)
                    .build();
                  return [keywordsProperty];
                } else {
                  const keywordsProperty = new ExifPropertyBuilder<string[]>(
                    'Keywords',
                  )
                    .withValueGetter(() => Array.from(tags))
                    .withValidator(validateKeywords)
                    .withErrorMessage(`Invalid for ${fileMetadata.fullPath}`)
                    .build();
                  return [keywordsProperty];
                }
              }),
              TE.chain((exifProperties) =>
                onlyExifApply({
                  filepath: fileMetadata.fullPath,
                  exifProperties,
                }),
              ),
            );
          })(fileMetadataList),
          TE.map(() => void 0),
        );
      }),

      TE.map(() => void 0),
    );
  };

  private extract = (
    filePath: string,
  ): TE.TaskEither<Error, Option<FileMetadata>> => {
    return pipe(
      safeExtract(compositeExtractor([]), filePath),
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
