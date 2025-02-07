import { createLogger, format, transports } from 'winston';

// Configuration du logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info', // Niveau de log en fonction de l'environnement
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss', // Ajout d'un timestamp
    }),
    format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`) // Format lisible des logs
  ),
  transports: [
    new transports.Console(), // Logs affichés dans la console
    new transports.File({ filename: 'logs/app.log', level: 'error' }), // Logs d'erreurs écrits dans un fichier
  ],
});

// Ajout d'un transport spécifique pour la production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new transports.File({
      filename: 'logs/combined.log',
      level: 'info',
    })
  );
}

export default logger;
