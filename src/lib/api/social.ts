import { request, authHeaders } from './client'
import type {
  SocialTemplateRow,
  SocialTemplatePayload,
  SocialTemplateWriteResult,
  SocialTemplateField,
} from './types'

// Public published-only feed (works unauthenticated for anonymous users).
export function getPublishedSocialTemplates() {
  return request<{ templates: SocialTemplateRow[] }>('/social-templates')
}

export function getAdminSocialTemplates() {
  return request<{ templates: SocialTemplateRow[] }>('/admin/social-templates', {
    headers: authHeaders(),
  })
}

export function getAdminSocialTemplate(id: string) {
  return request<{ template: SocialTemplateRow }>(`/admin/social-templates/${id}`, {
    headers: authHeaders(),
  })
}

export function createSocialTemplate(payload: SocialTemplatePayload) {
  return request<SocialTemplateWriteResult>('/admin/social-templates', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export function updateSocialTemplate(
  id: string,
  payload: Partial<SocialTemplatePayload>,
  version: number
) {
  return request<SocialTemplateWriteResult>(`/admin/social-templates/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ ...payload, version }),
  })
}

export function publishSocialTemplate(id: string, version: number) {
  return request<{ ok: boolean; status: string }>(`/admin/social-templates/${id}/publish`, {
    method: 'POST',
    headers: { ...authHeaders(), 'If-Match': String(version) },
  })
}

export function disableSocialTemplate(id: string, version: number) {
  return request<{ ok: boolean; status: string }>(`/admin/social-templates/${id}/disable`, {
    method: 'POST',
    headers: { ...authHeaders(), 'If-Match': String(version) },
  })
}

export function deleteSocialTemplate(id: string) {
  return request<{ ok: boolean }>(`/admin/social-templates/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

export function importSocialTemplateHtml(html: string, css?: string) {
  return request<{
    html: string
    css: string
    tokens: string[]
    repeats: string[]
    suggestedFields: SocialTemplateField[]
    warnings: string[]
  }>('/admin/social-templates/import', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ html, css }),
  })
}
