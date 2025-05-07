import { createLogger, format, transports } from "winston";

declare global {
  var logger: ReturnType<typeof createLogger>; // runtime
  interface GlobalThis {
    logger: ReturnType<typeof createLogger>; // type-safe globalThis.logger
  }
}

// Create a Winston logger instance
const logger = createLogger({
  level: "info", // Default log level
  format: format.combine(
    format.colorize(), // Add colors to the output
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamps
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    }),
  ),
  transports: [
    new transports.Console(), // Log to the console
    // new transports.File({ filename: "logs/app.log" }), // Log to a file
  ],
});

// Attach the logger to the global object
global.logger = logger;

export default logger;
