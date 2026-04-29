import { logger } from '@/lib/logger'

type ConsoleMethod = 'log' | 'warn' | 'error' | 'debug'

function spyOnConsole(method: ConsoleMethod) {
  return jest.spyOn(console, method).mockImplementation()
}

function parseLogOutput(spy: jest.SpyInstance): Record<string, unknown> {
  return JSON.parse(spy.mock.calls[0][0])
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe.each<{
  level: 'info' | 'warn' | 'error'
  consoleMethod: ConsoleMethod
}>([
  { level: 'info', consoleMethod: 'log' },
  { level: 'warn', consoleMethod: 'warn' },
  { level: 'error', consoleMethod: 'error' },
])('logger.$level', ({ level, consoleMethod }) => {
  it(`calls console.${consoleMethod} with JSON containing level=${level}`, () => {
    const spy = spyOnConsole(consoleMethod)
    logger[level]('test message')
    expect(spy).toHaveBeenCalledTimes(1)
    const entry = parseLogOutput(spy)
    expect(entry.level).toBe(level)
    expect(entry.message).toBe('test message')
    expect(entry.timestamp).toBeDefined()
  })
})

describe('logger.info metadata', () => {
  it('includes metadata fields in the output', () => {
    const spy = spyOnConsole('log')
    logger.info('with meta', { requestId: '123' })
    const entry = parseLogOutput(spy)
    expect(entry.requestId).toBe('123')
  })
})

describe('logger.debug', () => {
  let originalEnv: string | undefined

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it('does not log when NODE_ENV is not development', () => {
    process.env.NODE_ENV = 'production'
    const spy = spyOnConsole('debug')
    logger.debug('debug message')
    expect(spy).not.toHaveBeenCalled()
  })

  it('logs when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development'
    const spy = spyOnConsole('debug')
    logger.debug('debug message')
    expect(spy).toHaveBeenCalledTimes(1)
    const entry = parseLogOutput(spy)
    expect(entry.level).toBe('debug')
    expect(entry.message).toBe('debug message')
  })
})

describe('log entry timestamp', () => {
  it('has ISO timestamp format', () => {
    const spy = spyOnConsole('log')
    logger.info('timestamp check')
    const entry = parseLogOutput(spy)
    expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
  })
})
