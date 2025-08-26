// Formatação de moeda brasileira
export const formatCurrency = (value: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value / 100) // Assumindo que o valor vem em centavos
}

// Formatação de data brasileira
export const formatDate = (dateString: string, includeTime: boolean = false): string => {
  const date = new Date(dateString)
  
  if (includeTime) {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Formatação de CPF
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/)
  
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`
  }
  
  return cpf
}

// Formatação de telefone brasileiro
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  
  return phone
}

// Formatação de CEP
export const formatCEP = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{5})(\d{3})$/)
  
  if (match) {
    return `${match[1]}-${match[2]}`
  }
  
  return cep
}

// Formatação de número de cartão (mascarado)
export const formatCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '')
  const lastFour = cleaned.slice(-4)
  
  if (cleaned.length >= 4) {
    return `**** **** **** ${lastFour}`
  }
  
  return cardNumber
}

// Formatação de data relativa (ex: "há 2 dias")
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    return 'Hoje'
  } else if (diffInDays === 1) {
    return 'Ontem'
  } else if (diffInDays > 1 && diffInDays < 7) {
    return `Há ${diffInDays} dias`
  } else if (diffInDays >= 7 && diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `Há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
  } else if (diffInDays >= 30 && diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return `Há ${months} ${months === 1 ? 'mês' : 'meses'}`
  } else {
    const years = Math.floor(diffInDays / 365)
    return `Há ${years} ${years === 1 ? 'ano' : 'anos'}`
  }
}

// Formatação de tamanho de arquivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {return '0 Bytes'}
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Formatação de porcentagem
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`
}

// Formatação de número com separadores
export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}
