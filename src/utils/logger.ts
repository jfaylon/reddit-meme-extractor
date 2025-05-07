import { createLogger, format, transports } from "winston";

declare global {
  var logger: ReturnType<typeof createLogger>;
  interface GlobalThis {
    logger: ReturnType<typeof createLogger>; 
  }
}

const logger = createLogger({
  level: "info", 
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), 
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    }),
  ),
  transports: [
    new transports.Console(), // Log to the console
    // new transports.File({ filename: "logs/app.log" }), // Log to a file
  ],
});

global.logger = logger;

export default logger;
