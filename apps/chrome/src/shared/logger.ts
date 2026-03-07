/**
 * Environment-aware logger.
 * Debug logs are only visible in development environments.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  info: (...args: any[]) => {
    console.info(...args);
  },
  warn: (...args: any[]) => {
    console.warn(...args);
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
};
