import * as fs from 'fs/promises';
import * as TE from 'fp-ts/lib/TaskEither.js';
import { isLeft } from 'fp-ts/lib/Either.js';
import { pipe } from 'fp-ts/lib/function.js';
import * as path from 'path';

export class TagsDictionaryConfiguration {
  private static instance: TagsDictionaryConfiguration | null = null;

  private static readonly FILE_PATH = path.join(
    __dirname,
    '../../resources/tags_dictionary.json',
  );

  private hash: Record<string, string> | null = null;

  private constructor() {}

  public static getInstance(): TagsDictionaryConfiguration {
    if (!TagsDictionaryConfiguration.instance) {
      TagsDictionaryConfiguration.instance = new TagsDictionaryConfiguration();
    }
    return TagsDictionaryConfiguration.instance;
  }

  private loadJson = pipe(
    TE.tryCatch(
      async () => {
        const content = await fs.readFile(
          TagsDictionaryConfiguration.FILE_PATH,
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

  public async getTagsByName(): Promise<Record<string, string>> {
    await this.ensureLoaded();
    return this.hash!;
  }
}

export default TagsDictionaryConfiguration.getInstance();
