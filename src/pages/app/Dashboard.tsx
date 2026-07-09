import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { TOOLS } from '@/lib/tools'
import { useAuth } from '@/hooks/useAuth'
import { usePlan } from '@/hooks/usePlan'
import { getAuthToken } from '@/lib/auth'
import { getUsage } from '@/lib/api'
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

export default function Dashboard() {
  const { user } = useAuth()
  const { isPro } = usePlan()
  const [usage, setUsage] = useState<UsageItem[]>([])
  const [usageLoading, setUsageLoading] = useState(true)
  const [upsellVisible, setUpsellVisible] = useState(() => shouldShowUpsell())
  const [welcomeVisible, setWelcomeVisible] = useState(() => !localStorage.getItem(WELCOME_KEY) && !localStorage.getItem(LAST_TOOL_KEY))

  const tools = useMemo(() => {
    const lastToolId = localStorage.getItem(LAST_TOOL_KEY)
    if (!lastToolId) return TOOLS
    const recent = TOOLS.find((tool) => tool.id === lastToolId)
    if (!recent) return TOOLS
    return [recent, ...TOOLS.filter((tool) => tool.id !== lastToolId)]
  }, [])

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
            <p>All processing runs locally in your browser — files never upload. Pick {tools[0]?.name || 'a tool'} to try your first export.</p>
          </div>
          <div className="dashboard-welcome__actions">
            <Link to={tools[0]?.appPath || '/app/dashboard'} className="dashboard-welcome__btn" onClick={dismissWelcome}>
              Open {tools[0]?.name || 'a tool'} →
            </Link>
            <button type="button" onClick={dismissWelcome} className="dashboard-welcome__dismiss">Dismiss</button>
          </div>
        </section>
      )}

      {!isPro && upsellVisible && (
        <section className="dashboard-upsell">
          <div>
            <span className="dashboard-upsell__badge">Pro</span>
            <h2>Get unlimited access — IDR 99,000 / $9 a month.</h2>
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

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <h2>Quick access</h2>
          <span>{tools.length} tools</span>
        </div>
        <div className="dashboard-tool-grid">
          {tools.map((tool, index) => (
            <Link
              key={tool.id}
              to={tool.appPath}
              className={`dashboard-tool-card ${index === 0 ? 'dashboard-tool-card--recent' : ''}`}
              onClick={() => localStorage.setItem(LAST_TOOL_KEY, tool.id)}
            >
              <span className="dashboard-tool-card__icon">{tool.icon}</span>
              {index === 0 && <span className="dashboard-tool-card__recent">Recent</span>}
              <h3>{tool.name}</h3>
              <p>{tool.description}</p>
              <span className="dashboard-tool-card__arrow">Open →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
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
