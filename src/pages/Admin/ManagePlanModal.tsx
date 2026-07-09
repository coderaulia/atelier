import { useState } from 'react'
import { patchAdminUser, grantCredits, type User } from '../../lib/api'

type Tier = 'starter' | 'pro' | 'business'
type PlanSelection = 'free' | Tier

interface Props {
  user: User
  onClose: () => void
  onSaved: (message: string) => void
}

function toDateInput(unix: number | null | undefined): string {
  if (!unix) return ''
  return new Date(unix * 1000).toISOString().slice(0, 10)
}

export default function ManagePlanModal({ user, onClose, onSaved }: Props) {
  const initialSelection: PlanSelection = user.plan === 'pro' ? (user.pro_tier ?? 'pro') : 'free'
  const [selection, setSelection] = useState<PlanSelection>(initialSelection)
  const [expiry, setExpiry] = useState<string>(toDateInput(user.pro_expires_at) || defaultExpiry())
  const [packType, setPackType] = useState<'cv-10' | 'social-50'>('cv-10')
  const [packCredits, setPackCredits] = useState<number>(10)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function defaultExpiry(): string {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() + 30)
    return d.toISOString().slice(0, 10)
  }

  async function handleSavePlan() {
    setSaving(true)
    setError('')
    try {
      if (selection === 'free') {
        await patchAdminUser(user.id, { plan: 'free', pro_tier: null })
        onSaved(`${user.email} set to Free`)
      } else {
        const expiresAt = expiry ? Math.floor(new Date(`${expiry}T23:59:59Z`).getTime() / 1000) : null
        await patchAdminUser(user.id, { plan: 'pro', pro_tier: selection, pro_expires_at: expiresAt })
        onSaved(`${user.email} set to Pro · ${selection}${expiry ? ` until ${expiry}` : ''}`)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plan')
    } finally {
      setSaving(false)
    }
  }

  async function handleGrantCredits() {
    if (packCredits < 1) return
    setSaving(true)
    setError('')
    try {
      await grantCredits(user.id, packType, packCredits)
      onSaved(`Granted ${packCredits} ${packType} credits to ${user.email}`)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant credits')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal__backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h2>Manage plan · {user.email}</h2>
          <button className="admin-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-modal__section">
          <div className="admin-form-row">
            <label htmlFor="mp-tier">Plan / Tier</label>
            <select id="mp-tier" value={selection} onChange={(e) => setSelection(e.target.value as PlanSelection)}>
              <option value="free">Free</option>
              <option value="starter">Pro · Starter (30/day)</option>
              <option value="pro">Pro · Pro (100/day)</option>
              <option value="business">Pro · Business (300/day)</option>
            </select>
          </div>

          {selection !== 'free' && (
            <div className="admin-form-row">
              <label htmlFor="mp-expiry">Pro expires</label>
              <input id="mp-expiry" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
          )}

          <div className="admin-modal__actions">
            <button className="admin-btn admin-btn--primary" onClick={handleSavePlan} disabled={saving}>
              {saving ? 'Saving…' : 'Save plan'}
            </button>
          </div>
        </div>

        <div className="admin-modal__divider" />

        <div className="admin-modal__section">
          <h3 className="admin-modal__subtitle">Grant credit pack</h3>
          <div className="admin-modal__row-inline">
            <div className="admin-form-row">
              <label htmlFor="mp-pack">Pack</label>
              <select
                id="mp-pack"
                value={packType}
                onChange={(e) => {
                  const next = e.target.value as 'cv-10' | 'social-50'
                  setPackType(next)
                  setPackCredits(next === 'cv-10' ? 10 : 50)
                }}
              >
                <option value="cv-10">CV pack (cv-10)</option>
                <option value="social-50">Social pack (social-50)</option>
              </select>
            </div>
            <div className="admin-form-row">
              <label htmlFor="mp-credits">Credits</label>
              <input
                id="mp-credits"
                type="number"
                min={1}
                max={1000}
                value={packCredits}
                onChange={(e) => setPackCredits(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="admin-modal__actions">
            <button className="admin-btn" onClick={handleGrantCredits} disabled={saving}>
              {saving ? 'Granting…' : 'Grant credits'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
