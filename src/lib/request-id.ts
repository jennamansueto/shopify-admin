import { v4 as uuidv4 } from 'uuid'

export function generateRequestId(): string {
  return uuidv4()
}

export function withRequestId(handler: (requestId: string) => Promise<Response>): Promise<Response> {
  const requestId = generateRequestId()
  return handler(requestId)
}
