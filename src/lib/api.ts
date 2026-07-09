import { getAuthToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

export interface User {
  id: string
  email: string
  name?: string | null
  plan: 'free' | 'pro'
  pro_tier?: 'starter' | 'pro' | 'business' | null
  role?: 'user' | 'admin'
  status?: 'active' | 'banned'
  pro_expires_at?: number | null
  cancel_at_period_end?: boolean | number
  grace_until?: number | null
  email_verified?: number
  created_at?: number
  last_login?: number | null
  deleted_at?: number | null
  total_tool_uses?: number
}

interface AuthResponse {
  token: string
  user: User
}

export interface UsageStatus {
  used: number
  limit: number | null
  reset_at: number
  has_watermark?: boolean
  credits_available?: number
}

export interface Session {
  expires_at: number
  last_used: number | null
  user_agent: string | null
  current?: boolean
}

export interface Transaction {
  id: number
  user_id?: string
  user_email?: string
  amount: number
  currency: string
  plan_type: string
  status: 'success' | 'pending' | 'failed'
  midtrans_order_id?: string | null
  created_at: number
  email?: string
}

export type AdminTransaction = Transaction

export interface UsageLogEntry {
  date: string
  tool_id: string
  count: number
  limit: number | null
}

export class UsageLimitError extends Error {
  used: number
  limit: number | null
  reset_at: number
  constructor(used: number, limit: number | null, reset_at: number) {
    super('Daily limit reached')
    this.name = 'UsageLimitError'
    this.used = used
    this.limit = limit
    this.reset_at = reset_at
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    credentials: 'include',
    ...init,
  })
  const data = await res.json() as T & { error?: string }
  if (!res.ok) throw new Error((data as { error: string }).error ?? 'Request failed')
  return data
}

function authHeaders(token?: string | null): HeadersInit {
  const t = token ?? getAuthToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export function register(email: string, password: string) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function login(email: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getMe(token: string) {
  return request<{ user: User }>('/auth/me', {
    headers: authHeaders(token),
  })
}

export function getUsage(toolId: string, token: string) {
  return request<UsageStatus>(`/usage/${toolId}`, {
    headers: authHeaders(token),
  })
}

export async function incrementUsage(toolId: string, token: string): Promise<UsageStatus> {
  const res = await fetch(`${API_URL}/usage/${toolId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
  })
  const data = await res.json() as UsageStatus & { error?: string }
  if (res.status === 429) throw new UsageLimitError(data.used, data.limit, data.reset_at)
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data
}

export function getAnonUsage(toolId: string) {
  return request<UsageStatus>(`/anon-usage/${toolId}`)
}

export async function incrementAnonUsage(toolId: string): Promise<UsageStatus> {
  const res = await fetch(`${API_URL}/anon-usage/${toolId}`, { method: 'POST' })
  const data = await res.json() as UsageStatus & { error?: string }
  if (res.status === 429) throw new UsageLimitError(data.used, data.limit ?? 1, data.reset_at)
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data
}

// ── Account management ──────────────────────────────────────────
export function updateProfile(name: string | null) {
  return request<{ user: User }>('/auth/profile', {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  })
}

export function changePassword(currentPassword: string, newPassword: string) {
  return request<{ ok: true }>('/auth/change-password', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export function getSessions() {
  return request<{ sessions: Session[] }>('/auth/sessions', { headers: authHeaders() })
}

export function signOutAll() {
  return request<{ ok: true }>('/auth/sessions/all', {
    method: 'DELETE',
    headers: authHeaders(),
  })
}

export function deleteAccount(confirm: 'DELETE' = 'DELETE') {
  return request<{ ok: true }>('/auth/account', {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ confirm }),
  })
}

// ── Billing ─────────────────────────────────────────────────────
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

export function getTransactions() {
  return request<{ transactions: Transaction[] }>('/billing/transactions', { headers: authHeaders() })
}

export function getReceipt(txId: number) {
  return request<{ transaction: Transaction }>(`/billing/receipt/${txId}`, { headers: authHeaders() })
}

export function createCheckout(tier: 'starter' | 'pro' | 'business') {
  return request<{ snap_token: string; order_id: string }>('/billing/checkout', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ tier }),
  })
}

export function createPackCheckout(packId: 'cv-10' | 'social-50') {
  return request<{ snap_token: string; order_id: string }>('/billing/checkout-pack', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ pack_id: packId }),
  })
}

export interface PriceAmount {
  amount: number
  currency: string
  display: string
}

export interface Pricing {
  pro: {
    starter: { idr: PriceAmount; usd: PriceAmount }
    pro: { idr: PriceAmount; usd: PriceAmount }
    business: { idr: PriceAmount; usd: PriceAmount }
  }
  packs: {
    'cv-10': { credits: number; idr: PriceAmount; usd: PriceAmount }
    'social-50': { credits: number; idr: PriceAmount; usd: PriceAmount }
  }
}

export function getPricing() {
  return request<Pricing>('/billing/pricing')
}

// ── Usage log ───────────────────────────────────────────────────
export function getMyUsage() {
  return request<{ usage: UsageLogEntry[] }>('/usage/me', { headers: authHeaders() })
}

// ── Admin ───────────────────────────────────────────────────────
export type AdminStats = {
  total_users: number
  users_today: number
  pro_users: number
  free_users: number
  revenue_this_month: number
  top_tools: { tool_id: string; count: number }[]
  limit_hits_today: { tool_id: string; count: number }[]
  daily_tool_usage: { date: string; tool_id: string; count: number }[]
  daily_signups: { date: string; count: number }[]
}

export type AdminError = {
  id: number
  tool_id: string
  error_type: string
  user_agent?: string
  plan?: 'free' | 'pro'
  created_at: number
}

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

export function patchAdminUser(id: string, body: Partial<Pick<User, 'plan' | 'pro_tier' | 'status' | 'pro_expires_at'>>) {
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

export function getAdminTransactions(params: { page?: number; limit?: number; sort?: string; direction?: string }) {
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

// ─── Auth Lifecycle ───────────────────────────────────────────────

export function forgotPassword(email: string) {
  return request<{ ok: true }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function resetPassword(token: string, password: string) {
  return request<{ ok: true }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}

export function resendVerificationEmail() {
  return request<{ ok: true }>('/auth/verify-email', {
    method: 'POST',
    headers: authHeaders(),
  })
}

export function logout() {
  return request<{ ok: true }>('/auth/logout', {
    method: 'POST',
    headers: authHeaders(),
  })
}

// ─── Billing Lifecycle ────────────────────────────────────────────

export interface BillingStatus {
  plan: 'free' | 'pro'
  pro_expires_at: number | null
  cancel_at_period_end: number
  grace_until: number | null
}

export function getBillingStatus() {
  return request<BillingStatus>('/billing/status', { headers: authHeaders() })
}

// ─── Bug Reports ──────────────────────────────────────────────────

export interface BugReport {
  id: string
  user_id?: string
  email: string
  subject: string
  description: string
  tool_id?: string | null
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'in_progress' | 'resolved' | 'closed' | 'wont_fix'
  priority: number
  assigned_to?: string | null
  user_agent?: string | null
  screenshot_url?: string | null
  source: 'app' | 'email'
  created_at: number
  updated_at: number
  resolved_at?: number | null
  resolved_by?: string | null
  resolution_notes?: string | null
}

export interface BugReportComment {
  id: string
  bug_report_id: string
  user_id: string
  user_email?: string
  comment: string
  is_internal: number
  created_at: number
}

export function submitBugReport(payload: {
  subject: string
  description: string
  tool_id?: string
  screenshot_url?: string
}) {
  return request<{ id: string; message: string }>('/bug-reports', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
}

// Admin bug report functions
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

// ─── Admin Notifications ──────────────────────────────────────────

export interface AdminNotification {
  id: string
  type: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  link?: string | null
  is_read: number
  created_at: number
  read_at?: number | null
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

// ─── Admin Payment Management ─────────────────────────────────────

export interface AdminSubscription extends User {
  cancel_at_period_end?: boolean | number
  grace_until?: number | null
}

export interface SubscriptionSummary {
  active: number
  expiring_soon: number
  cancelled: number
  in_grace: number
}

export function getAdminSubscriptions(params: { page?: number; limit?: number; filter?: string }) {
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
  body: { action: 'extend' | 'cancel' | 'downgrade' | 'reactivate'; days?: number; reason?: string }
) {
  return request<{ user: User }>(`/admin/subscriptions/${userId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
}

export interface AdminRefund {
  id: string
  transaction_id: number
  user_id: string
  user_email: string
  amount: number
  currency: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  usage_count: number
  requested_at: number
  processed_at?: number | null
  notes?: string | null
}

export function getAdminRefunds(params: { page?: number; limit?: number; status?: string }) {
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

export interface RevenueAnalytics {
  mrr: number
  total_revenue: number
  avg_transaction: number
  trend: { date: string; revenue: number; count: number }[]
}

export interface UserAnalytics {
  total_users: number
  plan_breakdown: { plan: string; count: number }[]
  signups: { date: string; count: number }[]
  conversion_rate: number
  churn_rate: number
}

export interface ToolAnalytics {
  top_tools: { tool_id: string; total_uses: number; unique_users: number }[]
  daily_usage: { date: string; total: number }[]
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

export interface GeoAnalytics {
  geo: { country_code: string; unique_users: number }[]
}

export function getAdminGeoAnalytics(days = 30) {
  return request<GeoAnalytics>(`/admin/analytics/geo?days=${days}`, { headers: authHeaders() })
}

// ─── Admin System Management ──────────────────────────────────────

export interface SystemConfig {
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  description?: string | null
  updated_at?: number | null
}

export interface FeatureFlag {
  key: string
  enabled: number
  description?: string | null
  rollout_percentage: number
  user_whitelist?: string | null
  created_at: number
  updated_at: number
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: number
  checks: { database: string; api: string }
  metrics: {
    errors_last_hour: number
    active_sessions_24h: number
    pending_refunds: number
    unread_notifications: number
  }
}

export function getSystemConfig() {
  return request<{ config: SystemConfig[] }>('/admin/system/config', { headers: authHeaders() })
}

export function updateSystemConfig(key: string, value: string) {
  return request<{ config: SystemConfig }>(`/admin/system/config/${key}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ value }),
  })
}

export function getFeatureFlags() {
  return request<{ features: FeatureFlag[] }>('/admin/system/features', { headers: authHeaders() })
}

export function updateFeatureFlag(
  key: string,
  body: { enabled?: boolean; rollout_percentage?: number; user_whitelist?: string[] }
) {
  return request<{ feature: FeatureFlag }>(`/admin/system/features/${key}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
}

export function getHealthStatus() {
  return request<HealthStatus>('/admin/system/health', { headers: authHeaders() })
}

// ─── Admin Content Management ─────────────────────────────────────

export interface Announcement {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  target: 'all' | 'free' | 'pro'
  is_active: number
  start_at?: number | null
  end_at?: number | null
  created_at: number
  updated_at: number
}

export interface EmailTemplate {
  template_key: string
  subject?: string | null
  html_body?: string | null
  updated_at?: number
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

export function updateAdminAnnouncement(id: string, payload: Omit<Partial<Announcement>, 'is_active'> & { is_active?: boolean | number }) {
  return request<{ announcement: Announcement }>(`/admin/content/announcements/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
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

// ─── Admin Audit Logs ─────────────────────────────────────────────

export interface AuditLogEntry {
  id: number
  admin_id: string
  admin_email?: string | null
  action: string
  target_user_id?: string | null
  target_email?: string | null
  changes?: string | null
  ip_address?: string | null
  created_at: number
}

export function getAdminAuditLogs(params: { page?: number; limit?: number; action?: string; admin_id?: string; target_user_id?: string }) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => value && qs.set(key, String(value)))
  return request<{ page: number; limit: number; total: number; logs: AuditLogEntry[] }>(`/admin/audit?${qs}`, { headers: authHeaders() })
}

export function getAdminAuditActions() {
  return request<{ actions: { action: string; count: number }[] }>('/admin/audit/actions', { headers: authHeaders() })
}

export type CVAIAction = 'rewrite_bullet' | 'generate_summary' | 'improve_tone' | 'tailor_cv' | 'cover_letter'

export function generateCVAI(payload: { action: CVAIAction; text?: string; context?: string }) {
  return request<{ result: string }>('/api/cv/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
}
