type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  requestId?: string
  [key: string]: unknown
}

function createLogEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  }
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    const entry = createLogEntry('info', message, meta)
    console.log(JSON.stringify(entry))
  },
  warn(message: string, meta?: Record<string, unknown>) {
    const entry = createLogEntry('warn', message, meta)
    console.warn(JSON.stringify(entry))
  },
  error(message: string, meta?: Record<string, unknown>) {
    const entry = createLogEntry('error', message, meta)
    console.error(JSON.stringify(entry))
  },
  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      const entry = createLogEntry('debug', message, meta)
      console.debug(JSON.stringify(entry))
    }
  },
}
