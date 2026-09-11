/**
 * Sifo Drive — Structured OOP Logger
 * Facilitates enterprise debugging with namespaces, levels, and formatted console streams.
 */

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export class Logger {
  private readonly namespace: string;
  private static globalLevel: LogLevel = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  public static setLevel(level: LogLevel): void {
    Logger.globalLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= Logger.globalLevel;
  }

  private formatPrefix(levelName: string): string {
    const timestamp = new Date().toISOString().substring(11, 19);
    return `[${timestamp}] [${levelName}] [${this.namespace}]:`;
  }

  public debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`%c${this.formatPrefix('DEBUG')}`, 'color: #38bdf8;', message, ...args);
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`%c${this.formatPrefix('INFO')}`, 'color: #34d399; font-weight: bold;', message, ...args);
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`%c${this.formatPrefix('WARN')}`, 'color: #fbbf24; font-weight: bold;', message, ...args);
    }
  }

  public error(message: string, error?: unknown, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`%c${this.formatPrefix('ERROR')}`, 'color: #f87171; font-weight: bold;', message, error ?? '', ...args);
    }
  }
}
