/**
 * AfroStore RAG Engine — Structured Logger
 *
 * Lightweight structured logging. No external dependencies.
 * JSON output for production, human-readable for dev.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  component: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    code?: string;
    stack?: string;
  };
  durationMs?: number;
}

export class RAGLogger {
  private readonly component: string;
  private readonly minLevel: LogLevel;
  private readonly json: boolean;

  constructor(component: string, minLevel: LogLevel = 'info', json: boolean = true) {
    this.component = component;
    this.minLevel = minLevel;
    this.json = json;
  }

  child(subComponent: string): RAGLogger {
    return new RAGLogger(`${this.component}.${subComponent}`, this.minLevel, this.json);
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const entry: Partial<LogEntry> = { ...data };
    if (error instanceof Error) {
      (entry as LogEntry).error = {
        name: error.name,
        message: error.message,
        code: (error as { code?: string }).code,
        stack: error.stack,
      };
    }
    this.log('error', message, entry as Record<string, unknown>);
  }

  /** Log with timing */
  timed<T>(
    level: LogLevel,
    message: string,
    fn: () => T | Promise<T>,
    data?: Record<string, unknown>
  ): T | Promise<T> {
    const start = performance.now();
    const result = fn();

    if (result instanceof Promise) {
      return result
        .then((v) => {
          this.log(level, message, { ...data, durationMs: Math.round(performance.now() - start) });
          return v;
        })
        .catch((err) => {
          this.error(`${message} [FAILED]`, err, {
            ...data,
            durationMs: Math.round(performance.now() - start),
          });
          throw err;
        });
    }

    this.log(level, message, { ...data, durationMs: Math.round(performance.now() - start) });
    return result;
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.minLevel]) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      component: this.component,
      ...(data && { data }),
    };

    if (this.json) {
      const out = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      out(JSON.stringify(entry));
    } else {
      const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${this.component}]`;
      const out = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      out(`${prefix} ${message}`, data ? data : '');
    }
  }
}

/** Create a logger for a RAG component */
export function createLogger(
  component: string,
  level: LogLevel = 'info'
): RAGLogger {
  const isProduction = process.env.NODE_ENV === 'production';
  return new RAGLogger(`rag.${component}`, level, isProduction);
}
