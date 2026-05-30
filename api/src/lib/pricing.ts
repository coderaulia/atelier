/**
 * Central pricing configuration for Atelier.
 * 
 * Option A: Regional pricing
 * - IDR 99,000 for Indonesian market
 * - USD $9 for international market
 * 
 * This ensures displayed prices match charged amounts across:
 * - Frontend pricing pages
 * - Midtrans checkout creation
 * - Email receipts and confirmations
 */

export const PRICING = {
  pro: {
    monthly: {
      idr: {
        amount: 99000,
        currency: 'IDR',
        display: 'IDR 99,000',
      },
      usd: {
        amount: 9,
        currency: 'USD',
        display: '$9',
      },
    },
  },
  packs: {
    cv_10: {
      idr: { amount: 64000, currency: 'IDR', display: 'IDR 64,000' },
      usd: { amount: 4, currency: 'USD', display: '$4' },
    },
    social_50: {
      idr: { amount: 192000, currency: 'IDR', display: 'IDR 192,000' },
      usd: { amount: 12, currency: 'USD', display: '$12' },
    },
    growth_60: {
      idr: { amount: 256000, currency: 'IDR', display: 'IDR 256,000' },
      usd: { amount: 16, currency: 'USD', display: '$16' },
    },
  },
} as const

export type Currency = 'IDR' | 'USD'

export function getProPrice(currency: Currency = 'USD') {
  return currency === 'IDR' ? PRICING.pro.monthly.idr : PRICING.pro.monthly.usd
}

export function getPackPrice(packId: string, currency: Currency = 'USD') {
  const pack = PRICING.packs[packId as keyof typeof PRICING.packs]
  if (!pack) return null
  return currency === 'IDR' ? pack.idr : pack.usd
}
