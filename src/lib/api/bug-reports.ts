import { request, authHeaders } from './client'

export function submitBugReport(
  payload: {
    subject: string
    description: string
    tool_id?: string
    screenshot_url?: string
  },
  idempotencyKey = crypto.randomUUID()
) {
  return request<{ id: string; message: string }>('/bug-reports', {
    method: 'POST',
    headers: { ...authHeaders(), 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payload),
  })
}
