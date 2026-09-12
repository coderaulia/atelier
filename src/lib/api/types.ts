import type { GlobalMetadata } from "../globalMetadata"

export interface User {
  id: string
  email: string
  name?: string | null
  global_metadata?: Partial<GlobalMetadata> | null
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
  version?: number
  deleted_at?: number | null
  total_tool_uses?: number
}

export interface AuthResponse {
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

export interface BillingStatus {
  plan: 'free' | 'pro'
  pro_expires_at: number | null
  cancel_at_period_end: number
  grace_until: number | null
}

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
  version: number
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

export interface AdminSubscription extends User {
  cancel_at_period_end?: boolean | number
  grace_until?: number | null
  cv_credits?: number
  social_credits?: number
}

export interface SubscriptionSummary {
  active: number
  expiring_soon: number
  cancelled: number
  in_grace: number
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

export interface GeoAnalytics {
  geo: { country_code: string; unique_users: number }[]
}

export interface SystemConfig {
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  description?: string | null
  updated_at?: number | null
  version: number
}

export interface FeatureFlag {
  key: string
  enabled: number
  description?: string | null
  rollout_percentage: number
  user_whitelist?: string | null
  created_at: number
  updated_at: number
  version: number
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
  version: number
}

export interface EmailTemplate {
  template_key: string
  subject?: string | null
  html_body?: string | null
  updated_at?: number
}

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

export type CVAIAction = 'rewrite_bullet' | 'generate_summary' | 'improve_tone' | 'tailor_cv' | 'cover_letter'


export interface SocialTemplateField {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'image' | 'select'
  placeholder?: string
  hint?: string
  options?: { value: string; label: string }[]
}

export interface SocialTemplateRow {
  id: string
  name: string
  kind: string
  category?: string | null
  width: number
  height: number
  fields_json: string
  html: string
  css: string
  slides_json?: string | null
  is_pro: number
  version: number
  status?: string
  html_source?: string | null
  css_source?: string | null
  updated_at?: number
  created_at?: number
}

export interface SocialTemplateWriteResult {
  id: string
  version?: number
  tokens: string[]
  repeats: string[]
  warnings: string[]
}

export interface SocialTemplatePayload {
  id?: string
  name: string
  kind: string
  category?: string
  width: number
  height: number
  fields: SocialTemplateField[]
  html: string
  css: string
  slides?: string[]
  is_pro: boolean
}

export interface StoredDocumentItem {
  id: string
  user_id: string
  doc_type: string
  ref_no: string | null
  title: string | null
  client_name: string | null
  doc_date: string | null
  total_amount: number
  currency: string
  status: 'draft' | 'final'
  variant: string
  created_at: number
  updated_at: number
}

export interface StoredDocumentDetail extends StoredDocumentItem {
  data: any
}
