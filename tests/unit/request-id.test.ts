import { randomUUID } from 'crypto'

let callCount = 0
jest.mock('uuid', () => ({
  v4: () => {
    callCount++
    return randomUUID()
  },
}))

import { generateRequestId, withRequestId } from '@/lib/request-id'

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

beforeEach(() => {
  callCount = 0
})

describe('generateRequestId', () => {
  it('returns a string matching UUID v4 format', () => {
    const id = generateRequestId()
    expect(id).toMatch(UUID_V4_REGEX)
  })

  it('returns unique values on consecutive calls', () => {
    const id1 = generateRequestId()
    const id2 = generateRequestId()
    expect(id1).not.toBe(id2)
  })
})

describe('withRequestId', () => {
  it('calls the handler with a valid UUID string', async () => {
    const handler = jest.fn().mockResolvedValue(new Response('ok'))
    await withRequestId(handler)
    expect(handler).toHaveBeenCalledTimes(1)
    const passedId = handler.mock.calls[0][0]
    expect(passedId).toMatch(UUID_V4_REGEX)
  })

  it('returns the handler result', async () => {
    const response = new Response('test body')
    const handler = jest.fn().mockResolvedValue(response)
    const result = await withRequestId(handler)
    expect(result).toBe(response)
  })
})
