import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  formatPercentage,
  timeAgo,
  getStatusColor,
  formatStatusLabel,
  cn,
} from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats a standard dollar amount', () => {
    expect(formatCurrency(49.99)).toBe('$49.99')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats large amounts with comma separators', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })
})

describe('formatNumber', () => {
  it('formats integers with commas', () => {
    expect(formatNumber(10000)).toBe('10,000')
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    const result = formatDate(new Date('2025-03-15T00:00:00Z'))
    expect(result).toContain('Mar')
    expect(result).toContain('15')
    expect(result).toContain('2025')
  })

  it('formats an ISO date string', () => {
    const result = formatDate('2025-01-01T12:00:00Z')
    expect(result).toContain('2025')
  })
})

describe('formatDateTime', () => {
  it('includes time in the output', () => {
    const result = formatDateTime('2025-06-15T14:30:00Z')
    expect(result).toContain('Jun')
    expect(result).toContain('15')
    expect(result).toContain('2025')
  })
})

describe('getStatusColor', () => {
  it('returns correct class for paid status', () => {
    expect(getStatusColor('paid')).toBe('bg-green-100 text-green-800')
  })

  it('returns correct class for pending status', () => {
    expect(getStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800')
  })

  it('returns correct class for cancelled status', () => {
    expect(getStatusColor('cancelled')).toBe('bg-gray-100 text-gray-800')
  })

  it('returns fallback for unknown status', () => {
    expect(getStatusColor('unknown_status')).toBe('bg-gray-100 text-gray-800')
  })
})

describe('formatStatusLabel', () => {
  it('converts snake_case to Title Case', () => {
    expect(formatStatusLabel('partially_refunded')).toBe('Partially Refunded')
  })

  it('capitalizes single word', () => {
    expect(formatStatusLabel('pending')).toBe('Pending')
  })
})

describe('formatPercentage', () => {
  it("returns '+5.0%' for 5", () => {
    expect(formatPercentage(5)).toBe('+5.0%')
  })

  it("returns '-3.2%' for -3.2", () => {
    expect(formatPercentage(-3.2)).toBe('-3.2%')
  })

  it("returns '+0.0%' for 0", () => {
    expect(formatPercentage(0)).toBe('+0.0%')
  })
})

describe('timeAgo', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-06-15T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns 'just now' for a date a few seconds ago", () => {
    const date = new Date('2025-06-15T11:59:30Z')
    expect(timeAgo(date)).toBe('just now')
  })

  it("returns 'Xm ago' for a date minutes ago", () => {
    const date = new Date('2025-06-15T11:45:00Z')
    expect(timeAgo(date)).toBe('15m ago')
  })

  it("returns 'Xh ago' for a date hours ago", () => {
    const date = new Date('2025-06-15T09:00:00Z')
    expect(timeAgo(date)).toBe('3h ago')
  })

  it("returns 'Xd ago' for a date days ago (less than 7)", () => {
    const date = new Date('2025-06-13T12:00:00Z')
    expect(timeAgo(date)).toBe('2d ago')
  })

  it('returns a formatted date for dates older than 7 days', () => {
    const date = new Date('2025-05-01T12:00:00Z')
    const result = timeAgo(date)
    expect(result).toContain('May')
    expect(result).toContain('1')
    expect(result).toContain('2025')
  })
})

describe('cn', () => {
  it('merges class names', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toContain('px-4')
    expect(result).toContain('py-1')
  })
})
