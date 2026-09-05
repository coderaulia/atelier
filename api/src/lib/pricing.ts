/**
 * Central pricing configuration for Vanaila Studio.
 *
 * Regional pricing: IDR for Indonesian market, USD for international.
 * This ensures displayed prices match charged amounts across:
 * - Frontend pricing page
 * - Midtrans checkout creation
 * - Email receipts and confirmations
 *
 * `plan` on the users table stays a binary free/pro entitlement gate
 * (premium templates, bulk export, AI, no watermark). `pro_tier` only
 * decides price and daily export limit — see TIER_LIMITS.
 */

export type ProTier = 'starter' | 'pro' | 'business'

export const FREE_DAILY_LIMIT = 3

export const TIER_LIMITS: Record<ProTier, number> = {
  starter: 30,
  pro: 100,
  business: 300,
}

export const PRICING = {
  pro: {
    starter: {
      idr: { amount: 49000, currency: 'IDR', display: 'IDR 49,000' },
      usd: { amount: 5, currency: 'USD', display: '$5' },
    },
    pro: {
      idr: { amount: 99000, currency: 'IDR', display: 'IDR 99,000' },
      usd: { amount: 9, currency: 'USD', display: '$9' },
    },
    business: {
      idr: { amount: 249000, currency: 'IDR', display: 'IDR 249,000' },
      usd: { amount: 22, currency: 'USD', display: '$22' },
    },
  },
  packs: {
    'cv-10': {
      credits: 10,
      idr: { amount: 64000, currency: 'IDR', display: 'IDR 64,000' },
      usd: { amount: 4, currency: 'USD', display: '$4' },
    },
    'social-50': {
      credits: 50,
      idr: { amount: 192000, currency: 'IDR', display: 'IDR 192,000' },
      usd: { amount: 12, currency: 'USD', display: '$12' },
    },
  },
} as const

export type Currency = 'IDR' | 'USD'
export type PackId = keyof typeof PRICING.packs

export function getProPrice(tier: ProTier, currency: Currency = 'USD') {
  return currency === 'IDR' ? PRICING.pro[tier].idr : PRICING.pro[tier].usd
}

export function getPackPrice(packId: string, currency: Currency = 'USD') {
  const pack = PRICING.packs[packId as PackId]
  if (!pack) return null
  return currency === 'IDR' ? pack.idr : pack.usd
}
