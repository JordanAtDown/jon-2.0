import { pipe } from 'fp-ts/lib/function.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { cpus } from 'os';
import { setLogConsoleMode } from '../utils/Logger.js';
import HashTagGenerator from '../../../infra/shared/tag/HashTagGenerator.js';
import { Command } from 'commander';
import { loadDictionariesStep } from '../_step/LoadDictionariesStep.js';
import { applyTagsStep } from './_step/ApplyTagsStep.js';
import { validateApplyTagsParamsInput } from './_step/ValidateApplyTagsParamsStep.js';
import { ApplyTagsDictionaryCommand } from '../../../domain/restore/usecase/ApplyTagsDictionaryUseCase.js';
import { setMaxProcs } from '../../../domain/shared/exif/ExifWriting.js';

const numCores = cpus().length;
const defaultProcs = Math.max(1, Math.floor(numCores * 0.8));

export const applyTags = new Command('tags')
  .description('Apply tags from dictionary to all file from root directory')
  .argument('<rootDirectory>', 'source directory to scan')
  .argument('<batchSize>', 'Batch size for processing')
  .argument(
    '<extensions>',
    'list of extensions, separated by comma (e.g., video,image,jpg)',
  )
  .option('--console-mode', 'enable console log mode')
  .option(
    '-p, --procs <number>',
    `number of processes to use (default: ${defaultProcs})`,
  )
  .action(
    async (
      rootDirectory: string,
      batchSize: string,
      extensions: string,
      options: { consoleMode?: boolean; procs?: string },
    ) => {
      setLogConsoleMode(options.consoleMode || true);
      const procs = options.procs ? parseInt(options.procs, 10) : defaultProcs;
      setMaxProcs(procs);

      const applyTagsCommandInput = {
        rootDirectory,
        extensions,
        batchSize,
      };

      await pipe(
        Pipeline(applyTagsCommandInput),
        TE.match(
          (error: Error) => {
            console.error(error.message);
          },
          () => {
            console.info('Success');
          },
        ),
      )();
    },
  );

const Pipeline = (applyTagsCommandInput: {
  rootDirectory: string;
  extensions: string;
  batchSize: string;
}) =>
  pipe(
    validateApplyTagsParamsInput(applyTagsCommandInput),
    TE.chain(() =>
      pipe(
        loadDictionariesStep(),
        TE.chain((dictionaries) => {
          const applyTagsCommand: ApplyTagsDictionaryCommand = {
            batchSize: parseInt(applyTagsCommandInput.batchSize, 10),
            extensions: applyTagsCommandInput.extensions.split(','),
            rootDirectory: applyTagsCommandInput.rootDirectory,
          };

          const taggingDependencies = {
            tagsGenerator: new HashTagGenerator(dictionaries.tags),
          };

          return applyTagsStep(taggingDependencies, applyTagsCommand)();
        }),
      ),
    ),
  );
