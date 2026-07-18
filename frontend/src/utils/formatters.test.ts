import { describe, expect, it } from 'vitest'
import { formatNumber, formatPercent, formatXLM, truncateAddress } from './formatters'

describe('display formatters', () => {
  it('formats native Stellar amounts', () => {
    expect(formatXLM(12_500_000)).toBe('1.25 XLM')
  })

  it('formats compact values and signed percentages', () => {
    expect(formatNumber(1_250_000)).toBe('1.3M')
    expect(formatPercent(2.5)).toBe('+2.50%')
  })

  it('truncates only long wallet addresses', () => {
    expect(truncateAddress('GABCDEFGHIJKLMNOPQRSTUVWXYZ123456', 4)).toBe('GABCD...3456')
    expect(truncateAddress('GABCDE', 4)).toBe('GABCDE')
  })
})
