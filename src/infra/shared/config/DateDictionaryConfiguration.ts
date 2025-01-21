import * as fs from 'fs/promises';
import * as TE from 'fp-ts/TaskEither';
import { isLeft } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as path from 'path';

class DateDictionaryConfiguration {
  private static instance: DateDictionaryConfiguration | null = null;

  private static readonly FILE_PATH = path.join(
    __dirname,
    '../../resources/tags_dictionary.json',
  );

  private hash: Record<string, string> | null = null;

  private constructor() {}

  public static getInstance(): DateDictionaryConfiguration {
    if (!DateDictionaryConfiguration.instance) {
      DateDictionaryConfiguration.instance = new DateDictionaryConfiguration();
    }
    return DateDictionaryConfiguration.instance;
  }

  private loadJson = pipe(
    TE.tryCatch(
      async () => {
        const content = await fs.readFile(
          DateDictionaryConfiguration.FILE_PATH,
          'utf-8',
        );
        return JSON.parse(content) as Record<string, string>;
      },
      (error) =>
        new Error(
          `Erreur lors du chargement du fichier JSON: ${
            (error as Error).message
          }`,
        ),
    ),
  );

  private async ensureLoaded(): Promise<void> {
    if (this.hash) return;

    const result = await this.loadJson();
    if (isLeft(result)) {
      throw result.left;
    }

    this.hash = result.right;
  }

  public async getDateByName(): Promise<Record<string, string>> {
    await this.ensureLoaded();
    return this.hash!;
  }
}

export default DateDictionaryConfiguration.getInstance();
