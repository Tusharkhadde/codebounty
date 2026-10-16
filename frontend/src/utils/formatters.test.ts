import { describe, expect, it } from 'vitest'
import { formatNumber, formatPercent, formatTokenAmount, formatXLM, truncateAddress, usdHint } from './formatters'

describe('display formatters', () => {
  it('formats bounty amounts entered in XLM', () => {
    expect(formatXLM(1000)).toBe('1000 XLM')
    expect(formatXLM(12.5)).toBe('12.5 XLM')
  })

  it('formats amounts with their token, defaulting legacy rows to XLM', () => {
    expect(formatTokenAmount(250, 'USDC')).toBe('250 USDC')
    expect(formatTokenAmount(12.5, 'usdc')).toBe('12.5 USDC')
    expect(formatTokenAmount(100, null)).toBe('100 XLM')
    expect(formatTokenAmount(100, 'XLM')).toBe('100 XLM')
  })

  it('shows a USD hint only for USDC', () => {
    expect(usdHint(1500, 'USDC')).toBe('≈ $1,500')
    expect(usdHint(1500, 'XLM')).toBeNull()
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
