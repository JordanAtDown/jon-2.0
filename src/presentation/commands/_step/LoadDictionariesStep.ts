import { PipelineStep } from './PipelineStep.js';
import { DateDictionaryConfiguration } from '../../../infra/shared/config/DateDictionaryConfiguration.js';
import { TagsDictionaryConfiguration } from '../../../infra/shared/config/TagsDictionaryConfiguration.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { pipe } from 'fp-ts/lib/function.js';

export type Dictionaries = {
  dates: Record<string, string>;
  tags: Record<string, string>;
};

export const loadDictionariesStep: PipelineStep<void, Dictionaries> = () =>
  pipe(
    TE.Do,
    TE.bind('dates', () =>
      TE.fromTask(async () =>
        DateDictionaryConfiguration.getInstance().getDateByName(),
      ),
    ),
    TE.bind('tags', () =>
      TE.fromTask(async () =>
        TagsDictionaryConfiguration.getInstance().getTagsByName(),
      ),
    ),
    TE.map(({ dates, tags }) => ({
      dates,
      tags,
    })),
  );
