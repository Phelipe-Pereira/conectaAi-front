// Validação de CPF
export const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '')
  
  if (cleaned.length !== 11) {return false}
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {return false}
  
  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) {remainder = 0}
  if (remainder !== parseInt(cleaned.charAt(9))) {return false}
  
  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) {remainder = 0}
  if (remainder !== parseInt(cleaned.charAt(10))) {return false}
  
  return true
}

// Validação de CNPJ
export const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, '')
  
  if (cleaned.length !== 14) {return false}
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleaned)) {return false}
  
  // Validação do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights1[i]
  }
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder
  if (digit1 !== parseInt(cleaned.charAt(12))) {return false}
  
  // Validação do segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights2[i]
  }
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder
  if (digit2 !== parseInt(cleaned.charAt(13))) {return false}
  
  return true
}

// Validação de e-mail
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validação de telefone brasileiro
export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

// Validação de CEP
export const validateCEP = (cep: string): boolean => {
  const cleaned = cep.replace(/\D/g, '')
  return cleaned.length === 8
}

// Validação de cartão de crédito (Luhn algorithm)
export const validateCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '')
  
  if (cleaned.length < 13 || cleaned.length > 19) {return false}
  
  let sum = 0
  let isEven = false
  
  // Percorre os dígitos da direita para a esquerda
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i))
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

// Validação de data de validade do cartão
export const validateCardExpiry = (expiry: string): boolean => {
  const [month, year] = expiry.split('/')
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1
  
  const expMonth = parseInt(month)
  const expYear = parseInt(year)
  
  if (expMonth < 1 || expMonth > 12) {return false}
  if (expYear < currentYear) {return false}
  if (expYear === currentYear && expMonth < currentMonth) {return false}
  
  return true
}

// Validação de CVV
export const validateCVV = (cvv: string): boolean => {
  const cleaned = cvv.replace(/\D/g, '')
  return cleaned.length >= 3 && cleaned.length <= 4
}

// Validação de senha forte
export const validateStrongPassword = (password: string): boolean => {
  // Mínimo 8 caracteres, pelo menos 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// Validação de URL
export const validateURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Validação de valor monetário
export const validateCurrency = (value: string): boolean => {
  const currencyRegex = /^\d+(\.\d{1,2})?$/
  return currencyRegex.test(value) && parseFloat(value) > 0
}

// Validação de número inteiro positivo
export const validatePositiveInteger = (value: string): boolean => {
  const integerRegex = /^\d+$/
  return integerRegex.test(value) && parseInt(value) > 0
}

// Validação de data futura
export const validateFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  const now = new Date()
  return date > now
}

// Validação de data passada
export const validatePastDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  const now = new Date()
  return date < now
}

// Validação de idade mínima
export const validateMinimumAge = (birthDate: string, minimumAge: number = 18): boolean => {
  const birth = new Date(birthDate)
  const now = new Date()
  const age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    return age - 1 >= minimumAge
  }
  
  return age >= minimumAge
}
