import winston, { format, transports } from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// TODO: Ajout d'un mode prod
function resolveLogFilePath(): string {
  const devLogPath = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(devLogPath)) {
    fs.mkdirSync(devLogPath, { recursive: true });
  }
  return path.join(devLogPath, 'app.log');
}

const logFilePath: string = resolveLogFilePath();

export const Logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    format.json(),
  ),
  transports: [
    new transports.File({
      filename: logFilePath,
      format: format.combine(
        format.uncolorize(),
        format.printf(
          (info) =>
            `[${info['timestamp']}] [${info.level.toUpperCase()}]: ${info.message}`,
        ),
      ),
    }),
  ],
});
