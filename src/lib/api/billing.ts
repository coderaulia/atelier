import { request, authHeaders } from './client'
import type { Transaction, Pricing, BillingStatus } from './types'

export function cancelSubscription() {
  return request<{ ok: true; pro_expires_at: number }>('/billing/cancel', {
    method: 'POST',
    headers: authHeaders(),
  })
}

export function reactivateSubscription() {
  return request<{ ok: true }>('/billing/reactivate', {
    method: 'POST',
    headers: authHeaders(),
  })
}

export function getTransactions(page = 1, limit = 50) {
  return request<{ page: number; limit: number; transactions: Transaction[] }>(
    `/billing/transactions?page=${page}&limit=${limit}`,
    { headers: authHeaders() }
  )
}

export function getReceipt(txId: number) {
  return request<{ transaction: Transaction }>(`/billing/receipt/${txId}`, {
    headers: authHeaders(),
  })
}

export function createCheckout(tier: 'starter' | 'pro' | 'business', idempotencyKey = crypto.randomUUID()) {
  return request<{ snap_token: string; order_id: string }>('/billing/checkout', {
    method: 'POST',
    headers: { ...authHeaders(), 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ tier }),
  })
}

export function createPackCheckout(packId: 'cv-10' | 'social-50', idempotencyKey = crypto.randomUUID()) {
  return request<{ snap_token: string; order_id: string }>('/billing/checkout-pack', {
    method: 'POST',
    headers: { ...authHeaders(), 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ pack_id: packId }),
  })
}

export function getPricing() {
  return request<Pricing>('/billing/pricing')
}

export function getBillingStatus() {
  return request<BillingStatus>('/billing/status', { headers: authHeaders() })
}
