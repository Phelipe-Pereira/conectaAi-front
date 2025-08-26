import { describe, it, expect } from 'vitest'
import { 
  validateCPF, 
  validateCNPJ, 
  validateEmail, 
  validatePhone, 
  validateCEP,
  validateCreditCard,
  validateStrongPassword
} from '@/utils/validators'

describe('Validators', () => {
  describe('validateCPF', () => {
    it('should validate valid CPF', () => {
      expect(validateCPF('12345678909')).toBe(true)
      expect(validateCPF('11144477735')).toBe(true)
    })

    it('should reject invalid CPF', () => {
      expect(validateCPF('12345678901')).toBe(false)
      expect(validateCPF('11111111111')).toBe(false)
      expect(validateCPF('123')).toBe(false)
      expect(validateCPF('')).toBe(false)
    })
  })

  describe('validateCNPJ', () => {
    it('should validate valid CNPJ', () => {
      expect(validateCNPJ('11222333000181')).toBe(true)
      expect(validateCNPJ('11444777000161')).toBe(true)
    })

    it('should reject invalid CNPJ', () => {
      expect(validateCNPJ('11222333000180')).toBe(false)
      expect(validateCNPJ('11111111111111')).toBe(false)
      expect(validateCNPJ('123')).toBe(false)
      expect(validateCNPJ('')).toBe(false)
    })
  })

  describe('validateEmail', () => {
    it('should validate valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('test+tag@example.com')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate valid phone numbers', () => {
      expect(validatePhone('11987654321')).toBe(true)
      expect(validatePhone('1187654321')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('119876543')).toBe(false)
      expect(validatePhone('')).toBe(false)
    })
  })

  describe('validateCEP', () => {
    it('should validate valid CEP', () => {
      expect(validateCEP('12345678')).toBe(true)
      expect(validateCEP('12345-678')).toBe(true)
    })

    it('should reject invalid CEP', () => {
      expect(validateCEP('123')).toBe(false)
      expect(validateCEP('1234567')).toBe(false)
      expect(validateCEP('')).toBe(false)
    })
  })

  describe('validateCreditCard', () => {
    it('should validate valid credit card numbers', () => {
      expect(validateCreditCard('4532015112830366')).toBe(true) // Visa
      expect(validateCreditCard('5425233430109903')).toBe(true) // Mastercard
    })

    it('should reject invalid credit card numbers', () => {
      expect(validateCreditCard('4532015112830367')).toBe(false)
      expect(validateCreditCard('123')).toBe(false)
      expect(validateCreditCard('')).toBe(false)
    })
  })

  describe('validateStrongPassword', () => {
    it('should validate strong passwords', () => {
      expect(validateStrongPassword('StrongPass123!')).toBe(true)
      expect(validateStrongPassword('MyP@ssw0rd')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(validateStrongPassword('weak')).toBe(false)
      expect(validateStrongPassword('weakpass')).toBe(false)
      expect(validateStrongPassword('WEAKPASS')).toBe(false)
      expect(validateStrongPassword('weakpass123')).toBe(false)
      expect(validateStrongPassword('')).toBe(false)
    })
  })
})
