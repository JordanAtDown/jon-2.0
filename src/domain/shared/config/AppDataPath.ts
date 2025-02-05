import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import * as path from 'path';
import * as os from 'os';
import { appName } from './Constant.js';

export class AppDataPath {
  private static instance: AppDataPath | null = null;
  private path: string | null = null;

  private constructor() {}

  public static getInstance(): AppDataPath {
    if (!AppDataPath.instance) {
      AppDataPath.instance = new AppDataPath();
    }
    return AppDataPath.instance;
  }

  private validateOS(): TE.TaskEither<Error, NodeJS.Platform> {
    return TE.fromPredicate(
      (platform) => platform === 'win32' || platform === 'linux',
      () =>
        new Error(
          'Unsupported operating system: only Windows and Linux are supported.',
        ),
    )(process.platform);
  }

  private getPathByPlatform(platform: NodeJS.Platform): string {
    if (platform === 'win32') {
      const basePath = process.env.LOCALAPPDATA || process.env.APPDATA;
      if (!basePath) {
        throw new Error('Unable to locate AppData directory on Windows.');
      }
      return path.join(basePath, appName);
    }
    return path.join(os.homedir(), `.${appName}`);
  }

  /**
   * Retrieves the AppData directory path.
   *
   * @returns {TE.TaskEither<Error, string>} AppData path or an error.
   */
  public getAppDataPath(): TE.TaskEither<Error, string> {
    if (this.path) return TE.right(this.path);

    return pipe(
      this.validateOS(),
      TE.chain((platform) =>
        TE.tryCatch(
          () => Promise.resolve(this.getPathByPlatform(platform)),
          (error) =>
            error instanceof Error
              ? error
              : new Error('Unexpected error while calculating AppData path.'),
        ),
      ),
      TE.map((computedPath) => {
        this.path = computedPath;
        return computedPath;
      }),
    );
  }
}

export default AppDataPath.getInstance();
