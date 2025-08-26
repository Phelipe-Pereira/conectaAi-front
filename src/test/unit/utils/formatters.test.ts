import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatCPF, formatPhone, formatCEP } from '@/utils/formatters'

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toContain('R$')
      expect(formatCurrency(1000)).toContain('10,00')
      expect(formatCurrency(1500)).toContain('15,00')
      expect(formatCurrency(123456)).toContain('1.234,56')
    })

    it('should handle zero values', () => {
      expect(formatCurrency(0)).toContain('R$')
      expect(formatCurrency(0)).toContain('0,00')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = '2024-01-15T10:30:00Z'
      expect(formatDate(date)).toBe('15/01/2024')
    })

    it('should format date with time when includeTime is true', () => {
      const date = '2024-01-15T10:30:00Z'
      const result = formatDate(date, true)
      expect(result).toContain('15/01/2024')
      expect(result).toMatch(/\d{2}:\d{2}/) // Verifica se tem formato de hora
    })
  })

  describe('formatCPF', () => {
    it('should format CPF correctly', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01')
      expect(formatCPF('123.456.789-01')).toBe('123.456.789-01')
    })

    it('should handle invalid CPF', () => {
      expect(formatCPF('123')).toBe('123')
      expect(formatCPF('')).toBe('')
    })
  })

  describe('formatPhone', () => {
    it('should format phone with 11 digits', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
    })

    it('should format phone with 10 digits', () => {
      expect(formatPhone('1187654321')).toBe('(11) 8765-4321')
    })

    it('should handle invalid phone', () => {
      expect(formatPhone('123')).toBe('123')
    })
  })

  describe('formatCEP', () => {
    it('should format CEP correctly', () => {
      expect(formatCEP('12345678')).toBe('12345-678')
      expect(formatCEP('12345-678')).toBe('12345-678')
    })

    it('should handle invalid CEP', () => {
      expect(formatCEP('123')).toBe('123')
    })
  })
})
