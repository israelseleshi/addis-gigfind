import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  silent?: boolean;
}

class Logger {
  private level: LogLevel = 'info';
  private prefix: string = '[Addis GigFind]';
  private silent: boolean = false;

  setLevel(level: LogLevel) {
    this.level = level;
  }

  setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  setSilent(silent: boolean) {
    this.silent = silent;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.silent) return false;
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.level];
  }

  debug(message: string, ...args: unknown[]) {
    if (this.shouldLog('debug')) {
      console.debug(`${this.prefix} ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]) {
    if (this.shouldLog('info')) {
      console.info(`${this.prefix} ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]) {
    if (this.shouldLog('warn')) {
      console.warn(`${this.prefix} ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]) {
    if (this.shouldLog('error')) {
      console.error(`${this.prefix} ${message}`, ...args);
    }
  }

  log(level: LogLevel, message: string, ...args: unknown[]) {
    switch (level) {
      case 'debug':
        this.debug(message, ...args);
        break;
      case 'info':
        this.info(message, ...args);
        break;
      case 'warn':
        this.warn(message, ...args);
        break;
      case 'error':
        this.error(message, ...args);
        break;
    }
  }
}

export const logger = new Logger();

export function createLogger(options: LoggerOptions): Logger {
  const newLogger = new Logger();
  if (options.level) newLogger.setLevel(options.level);
  if (options.prefix) newLogger.setPrefix(options.prefix);
  if (options.silent !== undefined) newLogger.setSilent(options.silent);
  return newLogger;
}
