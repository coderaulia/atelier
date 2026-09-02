import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { TOOLS, TOOL_CATEGORIES, getAllCategories, getToolsByCategory, type ToolDefinition } from '@/lib/tools'
import { useAuth } from '@/hooks/useAuth'
import { usePlan } from '@/hooks/usePlan'
import { getAuthToken } from '@/lib/auth'
import { getUsage, getPricing, type Pricing as PricingData } from '@/lib/api'
import AnnouncementsBanner from '@/components/AnnouncementsBanner'
import './dashboard.css'

interface UsageItem {
  toolId: string
  used: number
  limit: number
}

const UPSELL_KEY = 'vs_upsell_dismissed'
const LAST_TOOL_KEY = 'vs_last_used_tool'
const WELCOME_KEY = 'vs_welcome_dismissed'

const DOC_TYPE_INFO: Record<string, { name: string; icon: string; desc: string }> = {
  agreement:  { name: 'Agreement', icon: '📄', desc: 'Client engagement agreement' },
  invoice:    { name: 'Invoice', icon: '🧾', desc: 'Billing with auto-calculations' },
  proposal:   { name: 'Proposal', icon: '📑', desc: 'Client pitch & scope' },
  prd:        { name: 'PRD', icon: '📋', desc: 'Product requirements doc' },
  retainer:   { name: 'Retainer', icon: '🔄', desc: 'Monthly recurring design retainer' },
  receipt:    { name: 'Receipt', icon: '🏷️', desc: 'Payment confirmation slip' },
  onboarding: { name: 'Onboarding', icon: '🚀', desc: 'New client kickoff guide' },
  scopeguard: { name: 'Scope Guard', icon: '🛡️', desc: 'Revision terms & boundaries' },
  handover:   { name: 'Handover', icon: '📦', desc: 'Deliverables & credential handoff' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const { isPro } = usePlan()
  const [usage, setUsage] = useState<UsageItem[]>([])
  const [usageLoading, setUsageLoading] = useState(true)
  const [pricing, setPricing] = useState<PricingData | null>(null)
  const [upsellVisible, setUpsellVisible] = useState(() => shouldShowUpsell())
  const [welcomeVisible, setWelcomeVisible] = useState(() => !localStorage.getItem(WELCOME_KEY) && !localStorage.getItem(LAST_TOOL_KEY))

  const [pinnedDocTypes] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('dg.pinnedDocTypes.v1')
      return raw ? JSON.parse(raw) : ['agreement', 'invoice', 'proposal']
    } catch {
      return ['agreement', 'invoice', 'proposal']
    }
  })

  const recentTool = useMemo(() => {
    const lastToolId = localStorage.getItem(LAST_TOOL_KEY)
    if (!lastToolId) return undefined
    return TOOLS.find((tool) => tool.id === lastToolId)
  }, [])

  const categoryGroups = useMemo(
    () =>
      getAllCategories()
        .map((category) => ({ category, meta: TOOL_CATEGORIES[category], tools: getToolsByCategory(category) }))
        .filter((group) => group.tools.length > 0),
    []
  )

  const startTool = recentTool ?? TOOLS[0]

  const emailUnverified = user != null && user.email_verified === 0

  const dismissWelcome = () => {
    localStorage.setItem(WELCOME_KEY, '1')
    setWelcomeVisible(false)
  }

  useEffect(() => {
    const token = getAuthToken()
    if (!token || isPro) {
      setUsageLoading(false)
      return
    }

    Promise.all(
      TOOLS.map(async (tool) => {
        try {
          const result = await getUsage(tool.id, token)
          return { toolId: tool.id, used: result.used, limit: result.limit ?? tool.freeDailyLimit }
        } catch {
          return { toolId: tool.id, used: 0, limit: tool.freeDailyLimit }
        }
      })
    )
      .then(setUsage)
      .finally(() => setUsageLoading(false))
  }, [isPro])

  useEffect(() => {
    if (isPro) return
    getPricing().then(setPricing).catch(() => {})
  }, [isPro])

  const dismissUpsell = () => {
    localStorage.setItem(UPSELL_KEY, new Date().toISOString())
    setUpsellVisible(false)
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-hero__eyebrow">{getGreeting()}</span>
          <h1 className="dashboard-hero__title">{user?.name || user?.email?.split('@')[0] || 'Creator'}</h1>
          <p className="dashboard-hero__text">Pick a tool, finish faster, keep files private in your browser.</p>
        </div>
        <div className="dashboard-hero__glow" aria-hidden="true" />
      </section>

      <AnnouncementsBanner />

      {emailUnverified && (
        <div className="dashboard-verify" role="alert">
          <span>📧 Verify your email to secure your account and receive receipts.</span>
          <Link to="/verify-email" className="dashboard-verify__btn">Verify email</Link>
        </div>
      )}

      {welcomeVisible && (
        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-welcome__badge">Welcome</span>
            <h2>New here? Start with one tool.</h2>
            <p>All processing runs locally in your browser — files never upload. Pick {startTool?.name || 'a tool'} to try your first export.</p>
          </div>
          <div className="dashboard-welcome__actions">
            <Link to={startTool?.appPath || '/app/dashboard'} className="dashboard-welcome__btn" onClick={dismissWelcome}>
              Open {startTool?.name || 'a tool'} →
            </Link>
            <button type="button" onClick={dismissWelcome} className="dashboard-welcome__dismiss">Dismiss</button>
          </div>
        </section>
      )}

      {!isPro && upsellVisible && (
        <section className="dashboard-upsell">
          <div>
            <span className="dashboard-upsell__badge">Pro</span>
            <h2>Get more daily exports — plans from {pricing ? `${pricing.pro.starter.idr.display} / ${pricing.pro.starter.usd.display}` : 'IDR 49,000 / $5'} a month.</h2>
            <p>Remove daily limits, unlock premium templates, and speed up every workflow.</p>
          </div>
          <div className="dashboard-upsell__actions">
            <Link to="/pricing" className="dashboard-upsell__btn">Upgrade now</Link>
            <button type="button" onClick={dismissUpsell} className="dashboard-upsell__dismiss">Dismiss</button>
          </div>
        </section>
      )}

      {!isPro && (
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <h2>Usage today</h2>
            <Link to="/pricing">Upgrade to remove limits</Link>
          </div>
          {usageLoading ? (
            <div className="dashboard-usage-grid">
              {TOOLS.slice(0, 4).map((tool) => <div className="dashboard-usage-card is-loading" key={tool.id} />)}
            </div>
          ) : (
            <div className="dashboard-usage-grid">
              {TOOLS.map((tool) => {
                const item = usage.find((entry) => entry.toolId === tool.id)
                const used = item?.used ?? 0
                const limit = item?.limit ?? tool.freeDailyLimit
                const pct = Math.min(100, (used / (limit ?? 1)) * 100)
                return (
                  <article className="dashboard-usage-card" key={tool.id}>
                    <div className="dashboard-usage-card__top">
                      <span>{tool.icon}</span>
                      <strong>{tool.name}</strong>
                    </div>
                    <div className="dashboard-usage-card__bar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <p>{used}/{limit} used today</p>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      {pinnedDocTypes.length > 0 && (
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <h2>⭐ Priority Documents</h2>
            <Link to="/app/documents">Open Document Studio →</Link>
          </div>
          <div className="dashboard-tool-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {pinnedDocTypes.map((type) => {
              const doc = DOC_TYPE_INFO[type]
              if (!doc) return null
              return (
                <Link
                  key={type}
                  to={`/app/documents?type=${type}`}
                  className="dashboard-tool-card"
                  style={{ textDecoration: 'none', border: '1px solid rgba(148, 163, 184, 0.12)' }}
                >
                  <div className="dashboard-tool-card__icon" style={{ fontSize: '1.4rem' }}>{doc.icon}</div>
                  <div className="dashboard-tool-card__content">
                    <h3 style={{ fontSize: '0.95rem', margin: '0 0 4px', color: '#f1f5f9' }}>{doc.name}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(148, 163, 184, 0.7)', margin: 0 }}>{doc.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <h2>Quick access</h2>
          <span>{TOOLS.length} tools</span>
        </div>

        {recentTool && (
          <div className="dashboard-recent-section">
            <h3 className="dashboard-recent-title">Recently used</h3>
            <div className="dashboard-tool-grid dashboard-tool-grid--recent">
              <ToolCard tool={recentTool} recent />
            </div>
          </div>
        )}

        <div className="dashboard-categories-container">
          {categoryGroups.map((group) => (
            <div className="dashboard-category-group" key={group.category}>
              <div className="dashboard-category-header">
                <span className="dashboard-category-icon">{group.meta.icon}</span>
                <h3 className="dashboard-category-name">{group.meta.label}</h3>
              </div>
              <div className="dashboard-tool-grid">
                {group.tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ToolCard({ tool, recent = false }: { tool: ToolDefinition; recent?: boolean }) {
  return (
    <Link
      to={tool.appPath}
      className={`dashboard-tool-card ${recent ? 'dashboard-tool-card--recent' : ''}`}
      onClick={() => localStorage.setItem(LAST_TOOL_KEY, tool.id)}
    >
      <span className="dashboard-tool-card__icon">{tool.icon}</span>
      {recent && <span className="dashboard-tool-card__recent">Recent</span>}
      {!recent && tool.badge && (
        <span className={`dashboard-tool-card__badge dashboard-tool-card__badge--${tool.badge}`}>
          {tool.badge}
        </span>
      )}
      <h3>{tool.name}</h3>
      <p>{tool.description}</p>
      <span className="dashboard-tool-card__arrow">Open →</span>
    </Link>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function shouldShowUpsell(): boolean {
  const value = localStorage.getItem(UPSELL_KEY)
  if (!value) return true
  const dismissedAt = new Date(value).getTime()
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  return Date.now() - dismissedAt > sevenDays
}
