import winston, { format, transports } from 'winston';
import * as TE from 'fp-ts/lib/TaskEither.js';
import * as path from 'path';
import * as fs from 'fs';
import os from 'os';
import { AppDataPath } from '../../config/AppDataPath.js';

export enum LoggerMode {
  DEV = 'dev',
  PRODUCTION = 'production',
  TEST = 'test',
}

const ensureDirectoryExists = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Resolves the log file path based on the execution mode.
 *
 * @param {LoggerMode} mode - Execution mode (dev, production, test).
 * @returns {TE.TaskEither<Error, string>} Result of the path or an error.
 */
function resolveLogFilePath(mode: LoggerMode): TE.TaskEither<Error, string> {
  switch (mode) {
    case LoggerMode.DEV: {
      const devLogPath = path.join(process.cwd(), 'logs');
      ensureDirectoryExists(devLogPath);
      return TE.right(path.join(devLogPath, 'jon2-dev.log'));
    }

    case LoggerMode.PRODUCTION: {
      const appDataPathTask = AppDataPath.getInstance().getAppDataPath();

      return TE.map((appDataPath: string) => {
        const prodLogPath = path.join(appDataPath, 'jon2-production.log');
        ensureDirectoryExists(path.dirname(prodLogPath));
        return prodLogPath;
      })(appDataPathTask);
    }

    case LoggerMode.TEST: {
      const testLogPath = path.join(os.tmpdir(), 'test-logs', 'jon2-test.log');
      ensureDirectoryExists(path.dirname(testLogPath));
      return TE.right(testLogPath);
    }

    default:
      return TE.left(new Error(`Mode inconnu : ${mode}.`));
  }
}

/**
 * Creates and configures the Winston logger based on the execution mode.
 *
 * @param {LoggerMode} mode - Execution mode (dev, production, test).
 * @returns {Promise<winston.Logger>} The configured logger.
 */
async function createLogger(mode: LoggerMode): Promise<winston.Logger> {
  const resolveLogPathTask = resolveLogFilePath(mode);

  return TE.match(
    (error: Error) => {
      console.error(`Erreur de résolution du chemin de log : ${error.message}`);
      return winston.createLogger({
        level: 'silent',
      });
    },
    (filepath: string) => {
      const loggerTransports: winston.transport[] = [];

      loggerTransports.push(
        new transports.File({
          filename: filepath,
          format: format.combine(
            format.uncolorize(),
            format.json(),
            format.printf(
              (info) =>
                `[${info['timestamp']}] [${info.level.toUpperCase()}]: ${info.message}`,
            ),
          ),
        }),
      );

      return winston.createLogger({
        level: mode === LoggerMode.TEST ? 'warn' : 'info',
        format: format.combine(
          format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        ),
        transports: loggerTransports,
      });
    },
  )(resolveLogPathTask)();
}

const mode: LoggerMode =
  (process.env['NODE_ENV'] as LoggerMode) || LoggerMode.DEV;

const Logger = await createLogger(mode);

export default Logger;
