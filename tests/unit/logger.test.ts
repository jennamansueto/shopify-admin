import { logger } from '@/lib/logger'

afterEach(() => {
  jest.restoreAllMocks()
})

describe('logger.info', () => {
  it('calls console.log with JSON containing level, message, and timestamp', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()
    logger.info('test message')
    expect(spy).toHaveBeenCalledTimes(1)
    const entry = JSON.parse(spy.mock.calls[0][0])
    expect(entry.level).toBe('info')
    expect(entry.message).toBe('test message')
    expect(entry.timestamp).toBeDefined()
  })

  it('includes metadata fields in the output', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()
    logger.info('with meta', { requestId: '123' })
    const entry = JSON.parse(spy.mock.calls[0][0])
    expect(entry.requestId).toBe('123')
  })
})

describe('logger.warn', () => {
  it('calls console.warn with JSON containing level=warn', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation()
    logger.warn('warning message')
    expect(spy).toHaveBeenCalledTimes(1)
    const entry = JSON.parse(spy.mock.calls[0][0])
    expect(entry.level).toBe('warn')
    expect(entry.message).toBe('warning message')
  })
})

describe('logger.error', () => {
  it('calls console.error with JSON containing level=error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation()
    logger.error('error message')
    expect(spy).toHaveBeenCalledTimes(1)
    const entry = JSON.parse(spy.mock.calls[0][0])
    expect(entry.level).toBe('error')
    expect(entry.message).toBe('error message')
  })
})

describe('logger.debug', () => {
  it('does not log when NODE_ENV is not development', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    const spy = jest.spyOn(console, 'debug').mockImplementation()
    logger.debug('debug message')
    expect(spy).not.toHaveBeenCalled()
    process.env.NODE_ENV = originalEnv
  })

  it('logs when NODE_ENV is development', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    const spy = jest.spyOn(console, 'debug').mockImplementation()
    logger.debug('debug message')
    expect(spy).toHaveBeenCalledTimes(1)
    const entry = JSON.parse(spy.mock.calls[0][0])
    expect(entry.level).toBe('debug')
    expect(entry.message).toBe('debug message')
    process.env.NODE_ENV = originalEnv
  })
})

describe('log entry timestamp', () => {
  it('has ISO timestamp format', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()
    logger.info('timestamp check')
    const entry = JSON.parse(spy.mock.calls[0][0])
    expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
  })
})
