import { useEffect, useState } from 'react'
import { getActiveAnnouncements, type Announcement } from '../lib/api'

const colors: Record<string, { bg: string; border: string; text: string }> = {
  info:    { bg: 'rgba(59,130,246,.08)',  border: 'rgba(59,130,246,.25)',  text: '#2563eb' },
  warning: { bg: 'rgba(234,179,8,.08)',   border: 'rgba(234,179,8,.3)',    text: '#a16207' },
  success: { bg: 'rgba(34,197,94,.08)',   border: 'rgba(34,197,94,.25)',   text: '#15803d' },
  error:   { bg: 'rgba(220,38,38,.08)',   border: 'rgba(220,38,38,.25)',   text: '#b91c1c' },
}

export default function AnnouncementsBanner() {
  const [items, setItems] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    getActiveAnnouncements()
      .then((data) => setItems(data.announcements))
      .catch(() => {})
  }, [])

  const visible = items.filter((item) => !dismissed.has(item.id))
  if (!visible.length) return null

  return (
    <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
      {visible.map((item) => {
        const c = colors[item.type] ?? colors.info
        return (
          <div
            key={item.id}
            style={{
              padding: '12px 16px',
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: 13,
            }}
          >
            <div>
              <strong style={{ color: c.text }}>{item.title}</strong>
              <span style={{ marginLeft: 8, color: 'var(--ink-2)' }}>{item.message}</span>
            </div>
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(item.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--ink-3)', flexShrink: 0 }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
