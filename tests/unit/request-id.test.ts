import { randomUUID } from 'crypto'

jest.mock('uuid', () => ({ v4: () => randomUUID() }))

import { generateRequestId, withRequestId } from '@/lib/request-id'

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('generateRequestId', () => {
  it('returns a string matching UUID v4 format', () => {
    expect(generateRequestId()).toMatch(UUID_V4_REGEX)
  })

  it('returns unique values on consecutive calls', () => {
    expect(generateRequestId()).not.toBe(generateRequestId())
  })
})

describe('withRequestId', () => {
  it('calls the handler with a valid UUID string', async () => {
    const handler = jest.fn().mockResolvedValue(new Response('ok'))
    await withRequestId(handler)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler.mock.calls[0][0]).toMatch(UUID_V4_REGEX)
  })

  it('returns the handler result', async () => {
    const response = new Response('test body')
    const handler = jest.fn().mockResolvedValue(response)
    expect(await withRequestId(handler)).toBe(response)
  })
})
