import { request, authHeaders } from './client'
import type { StoredDocumentItem, StoredDocumentDetail } from './types'

export function listDocuments(
  params: {
    type?: string
    status?: string
    q?: string
    limit?: number
    offset?: number
  } = {}
) {
  const qp = new URLSearchParams()
  if (params.type) qp.set('type', params.type)
  if (params.status) qp.set('status', params.status)
  if (params.q) qp.set('q', params.q)
  if (params.limit) qp.set('limit', String(params.limit))
  if (params.offset) qp.set('offset', String(params.offset))
  const qs = qp.toString()
  return request<{
    items: StoredDocumentItem[]
    total: number
    limit: number
    offset: number
  }>(`/documents${qs ? `?${qs}` : ''}`, { headers: authHeaders() })
}

export function getDocument(id: string) {
  return request<StoredDocumentDetail>(`/documents/${id}`, { headers: authHeaders() })
}

export function createDocument(payload: {
  doc_type: string
  ref_no?: string | null
  title?: string | null
  client_name?: string | null
  doc_date?: string | null
  total_amount?: number
  currency?: string
  status?: 'draft' | 'final'
  variant?: string
  data: any
}) {
  return request<StoredDocumentItem>('/documents', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export function updateDocument(
  id: string,
  payload: {
    ref_no?: string | null
    title?: string | null
    client_name?: string | null
    doc_date?: string | null
    total_amount?: number
    currency?: string
    status?: 'draft' | 'final'
    variant?: string
    data: any
  }
) {
  return request<StoredDocumentItem>(`/documents/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export function deleteDocument(id: string) {
  return request<{ ok: boolean }>(`/documents/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

export function duplicateDocument(id: string) {
  return request<StoredDocumentItem>(`/documents/${id}/duplicate`, {
    method: 'POST',
    headers: authHeaders(),
  })
}
