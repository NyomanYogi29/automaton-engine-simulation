export type LogCategory = 'core' | 'sync' | 'canvas' | 'sim' | 'storage';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  enabled: boolean;
  minLevel: LogLevel;
}

const LEVEL_WEIGHTS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const CATEGORY_COLORS: Record<LogCategory, string> = {
  core: '#38bdf8', // sky-400
  sync: '#a855f7', // purple-500
  canvas: '#34d399', // emerald-400
  sim: '#f59e0b', // amber-500
  storage: '#94a3b8', // slate-400
};

const options: LoggerOptions = {
  enabled: import.meta.env.DEV,
  minLevel: 'debug',
};

function shouldLog(level: LogLevel): boolean {
  if (!options.enabled) return false;
  return LEVEL_WEIGHTS[level] >= LEVEL_WEIGHTS[options.minLevel];
}

function write(level: LogLevel, category: LogCategory, message: string, payload?: unknown) {
  if (!shouldLog(level)) return;

  const color = CATEGORY_COLORS[category];
  const tag = `%c[${category.toUpperCase()}]`;
  const style = `color: ${color}; font-weight: bold;`;

  const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

  if (payload !== undefined) {
    consoleFn(tag, style, message, payload);
  } else {
    consoleFn(tag, style, message);
  }
}

export const logger = {
  configure: (next: Partial<LoggerOptions>) => {
    Object.assign(options, next);
  },
  debug: (category: LogCategory, message: string, payload?: unknown) => write('debug', category, message, payload),
  info: (category: LogCategory, message: string, payload?: unknown) => write('info', category, message, payload),
  warn: (category: LogCategory, message: string, payload?: unknown) => write('warn', category, message, payload),
  error: (category: LogCategory, message: string, payload?: unknown) => write('error', category, message, payload),
};
