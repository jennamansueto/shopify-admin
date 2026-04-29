import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
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

describe('cn', () => {
  it('merges class names', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toContain('px-4')
    expect(result).toContain('py-1')
  })
})
