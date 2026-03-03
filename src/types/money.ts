// T010: Money branded type and utilities

/**
 * Money type - represents money in cents (integer) to avoid floating point issues
 * Uses TypeScript branding for type safety
 */
export type Money = number & { readonly __brand: 'Money' }

/**
 * Convert reais (R$) to Money (cents)
 * @param reais - Amount in reais (e.g., 10.50)
 * @returns Money in cents (e.g., 1050)
 */
export function toMoney(reais: number): Money {
  return Math.round(reais * 100) as Money
}

/**
 * Convert Money (cents) to reais (R$)
 * @param cents - Amount in cents
 * @returns Amount in reais
 */
export function fromMoney(cents: Money): number {
  return cents / 100
}

/**
 * Format Money as Brazilian currency string
 * @param cents - Amount in cents
 * @returns Formatted string (e.g., "R$ 10,50")
 */
export function formatMoney(cents: Money): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(fromMoney(cents))
}
