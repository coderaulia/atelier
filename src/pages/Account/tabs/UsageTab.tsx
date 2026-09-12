import { useState, useEffect } from 'react';
import { getMyUsage, type User, type UsageLogEntry } from '../../../lib/api';

export function UsageTab({ user: _user }: { user: User }) {
  const [usage, setUsage] = useState<UsageLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getMyUsage()
      .then((data) => setUsage(data.usage))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load usage history'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="account-panel">
      <h2>Usage · last 30 days</h2>
      {loading && <p>Loading…</p>}
      {!loading && error && <p className="account-message">{error}</p>}
      {!loading && !error && !usage.length && <p style={{ color: 'var(--ink-3)' }}>No usage yet.</p>}
      {!loading && !error && usage.length > 0 && (
        <table className="account-table">
          <thead><tr><th>Date</th><th>Tool</th><th>Uses</th><th>Limit</th></tr></thead>
          <tbody>
            {usage.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                <td>{row.tool_id}</td>
                <td>{row.count}</td>
                <td>{row.limit ?? 'unlimited'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

