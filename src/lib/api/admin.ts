import { request, authHeaders } from './client'
import type {
  User,
  Transaction,
  AdminStats,
  AdminError,
  BugReport,
  BugReportComment,
  AdminNotification,
  AdminSubscription,
  SubscriptionSummary,
  AdminRefund,
  RevenueAnalytics,
  UserAnalytics,
  ToolAnalytics,
  GeoAnalytics,
  SystemConfig,
  FeatureFlag,
  HealthStatus,
  Announcement,
  EmailTemplate,
  AuditLogEntry,
} from './types'

export function getAdminStats() {
  return request<AdminStats>('/admin/stats', { headers: authHeaders() })
}

export function getAdminUsers(params: { page?: number; limit?: number; search?: string; plan?: string }) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => value && qs.set(key, String(value)))
  return request<{ page: number; limit: number; total: number; users: User[] }>(`/admin/users?${qs}`, { headers: authHeaders() })
}

export function getAdminUser(id: string) {
  return request<{
    user: User
    transactions: Transaction[]
    usage_log: { date: string; tool_id: string; count: number; limit_hits: number }[]
    credits: { pack_type: string; remaining: number }[]
  }>(`/admin/users/${id}`, { headers: authHeaders() })
}

export function patchAdminUser(id: string, body: Partial<Pick<User, 'plan' | 'pro_tier' | 'status' | 'pro_expires_at'>> & { version: number }) {
  return request<{ user: User }>(`/admin/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
}

export function grantCredits(userId: string, packType: 'cv-10' | 'social-50', credits: number) {
  return request<{ pack: { id: number; pack_type: string; credits_total: number; credits_used: number } }>(`/admin/users/${userId}/grant-credits`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ pack_type: packType, credits }),
  })
}

export function getAdminTransactions(params: { page?: number; limit?: number; sort?: string; direction?: string; search?: string }) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => value && qs.set(key, String(value)))
  return request<{ page: number; limit: number; total: number; transactions: Transaction[] }>(`/admin/transactions?${qs}`, { headers: authHeaders() })
}

export function getAdminErrors() {
  return request<{ errors: AdminError[]; groups: { tool_id: string; error_type: string; count: number }[] }>('/admin/errors', { headers: authHeaders() })
}

export function logToolError(payload: { tool_id: string; error_type: string; user_agent?: string; plan?: 'free' | 'pro' }) {
  return request<{ ok: true }>('/api/log-error', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export function getAdminBugReports(params: {
  page?: number
  limit?: number
  status?: string
  severity?: string
  tool_id?: string
}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => value && qs.set(key, String(value)))
  return request<{
    page: number
    limit: number
    total: number
    bug_reports: BugReport[]
  }>(`/admin/bug-reports?${qs}`, { headers: authHeaders() })
}

export function getAdminBugReport(id: string) {
  return request<{ bug_report: BugReport; comments: BugReportComment[] }>(
    `/admin/bug-reports/${id}`,
    { headers: authHeaders() }
  )
}

export function patchAdminBugReport(
  id: string,
  body: {
    severity?: BugReport['severity']
    status?: BugReport['status']
    priority?: number
    assigned_to?: string | null
    resolution_notes?: string
    version: number
  }
) {
  return request<{ bug_report: BugReport }>(`/admin/bug-reports/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
}

export function addBugReportComment(id: string, comment: string, is_internal = false) {
  return request<{ id: string; message: string }>(`/admin/bug-reports/${id}/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ comment, is_internal }),
  })
}

export function getAdminBugReportStats() {
  return request<{
    by_status: { status: string; count: number }[]
    by_severity: { severity: string; count: number }[]
    by_tool: { tool_id: string; count: number }[]
  }>('/admin/bug-reports/stats/summary', { headers: authHeaders() })
}

export function getAdminNotifications(unreadOnly = false) {
  const qs = unreadOnly ? '?unread=1' : ''
  return request<{
    notifications: AdminNotification[]
    unread_count: number
  }>(`/admin/notifications${qs}`, { headers: authHeaders() })
}

export function markAdminNotificationRead(id: string) {
  return request<{ ok: true }>(`/admin/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  })
}

export function markAllAdminNotificationsRead() {
  return request<{ ok: true }>('/admin/notifications/read-all', {
    method: 'PATCH',
    headers: authHeaders(),
  })
}

export function getAdminSubscriptions(params: { page?: number; limit?: number; filter?: string; search?: string }) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => value && qs.set(key, String(value)))
  return request<{ page: number; limit: number; total: number; subscriptions: AdminSubscription[] }>(
    `/admin/subscriptions?${qs}`,
    { headers: authHeaders() }
  )
}

export function getAdminSubscriptionSummary() {
  return request<SubscriptionSummary>('/admin/subscriptions/summary', { headers: authHeaders() })
}

export function patchAdminSubscription(
  userId: string,
  body: { action: 'extend' | 'cancel' | 'downgrade' | 'reactivate'; days?: number; reason?: string; version: number }
) {
  return request<{ user: User }>(`/admin/subscriptions/${userId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
}

export function getAdminRefunds(params: { page?: number; limit?: number; status?: string; search?: string }) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => value && qs.set(key, String(value)))
  return request<{ page: number; limit: number; total: number; refunds: AdminRefund[] }>(
    `/admin/refunds?${qs}`,
    { headers: authHeaders() }
  )
}

export function createAdminRefund(payload: {
  transaction_id: number
  user_id: string
  amount: number
  reason: string
}) {
  return request<{ id: string; usage_count: number; eligible: boolean; message: string }>('/admin/refunds', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export function processAdminRefund(id: string, body: { status: 'approved' | 'rejected' | 'completed'; notes?: string }) {
  return request<{ refund: AdminRefund }>(`/admin/refunds/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
}

export function getAdminRevenueAnalytics(days = 30) {
  return request<RevenueAnalytics>(`/admin/analytics/revenue?days=${days}`, { headers: authHeaders() })
}

export function getAdminUserAnalytics(days = 30) {
  return request<UserAnalytics>(`/admin/analytics/users?days=${days}`, { headers: authHeaders() })
}

export function getAdminToolAnalytics(days = 30) {
  return request<ToolAnalytics>(`/admin/analytics/tools?days=${days}`, { headers: authHeaders() })
}

export function getAdminGeoAnalytics(days = 30) {
  return request<GeoAnalytics>(`/admin/analytics/geo?days=${days}`, { headers: authHeaders() })
}

export function getSystemConfig() {
  return request<{ config: SystemConfig[] }>('/admin/system/config', { headers: authHeaders() })
}

export function updateSystemConfig(key: string, value: string, version: number) {
  return request<{ config: SystemConfig }>(`/admin/system/config/${key}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'If-Match': String(version) },
    body: JSON.stringify({ value }),
  })
}

export function getFeatureFlags() {
  return request<{ features: FeatureFlag[] }>('/admin/system/features', { headers: authHeaders() })
}

export function updateFeatureFlag(
  key: string,
  body: { enabled?: boolean; rollout_percentage?: number; user_whitelist?: string[] }, version: number
) {
  return request<{ feature: FeatureFlag }>(`/admin/system/features/${key}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'If-Match': String(version) },
    body: JSON.stringify(body),
  })
}

export function getHealthStatus() {
  return request<HealthStatus>('/admin/system/health', { headers: authHeaders() })
}

export function getAdminAnnouncements() {
  return request<{ announcements: Announcement[] }>('/admin/content/announcements', { headers: authHeaders() })
}

export function createAdminAnnouncement(payload: Partial<Announcement>) {
  return request<{ id: string; message: string }>('/admin/content/announcements', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export function updateAdminAnnouncement(id: string, payload: Omit<Partial<Announcement>, 'is_active'> & { is_active?: boolean | number }, version: number) {
  return request<{ announcement: Announcement }>(`/admin/content/announcements/${id}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'If-Match': String(version) },
    body: JSON.stringify(payload),
  })
}

export function deleteAdminAnnouncement(id: string) {
  return request<{ ok: true }>(`/admin/content/announcements/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

export function getActiveAnnouncements() {
  return request<{ announcements: Announcement[] }>('/content/announcements', { headers: authHeaders() })
}

export function getAdminEmailTemplates() {
  return request<{ templates: EmailTemplate[] }>('/admin/content/email-templates', { headers: authHeaders() })
}

export function updateAdminEmailTemplate(key: string, payload: { subject: string; html_body: string }) {
  return request<{ ok: true }>(`/admin/content/email-templates/${key}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

export function getAdminAuditLogs(params: { page?: number; limit?: number; action?: string; admin_id?: string; target_user_id?: string }) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => value && qs.set(key, String(value)))
  return request<{ page: number; limit: number; total: number; logs: AuditLogEntry[] }>(`/admin/audit?${qs}`, { headers: authHeaders() })
}

export function getAdminAuditActions() {
  return request<{ actions: { action: string; count: number }[] }>('/admin/audit/actions', { headers: authHeaders() })
}
