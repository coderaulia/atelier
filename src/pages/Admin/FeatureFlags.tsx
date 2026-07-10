import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getFeatureFlags, updateFeatureFlag, type FeatureFlag } from '../../lib/api'

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function load() {
    setLoading(true)
    getFeatureFlags()
      .then((data) => setFlags(data.features))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function toggle(flag: FeatureFlag) {
    try {
      await updateFeatureFlag(flag.key, { enabled: !flag.enabled })
      setSuccess(`${flag.key} ${flag.enabled ? 'disabled' : 'enabled'}`)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function updateRollout(flag: FeatureFlag, percentage: number) {
    try {
      await updateFeatureFlag(flag.key, { rollout_percentage: percentage })
      setSuccess(`${flag.key} rollout set to ${percentage}%`)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  return (
    <AdminLayout active="feature-flags">
      <section className="admin-page">
        <div className="admin-header">
          <div>
            <div className="eyebrow eyebrow--accent">System</div>
            <h1>Feature Flags</h1>
            <p>Enable, disable, or gradually roll out features to users.</p>
          </div>
        </div>

        {error && <div className="admin-error">{error}<button onClick={() => setError('')}>×</button></div>}
        {success && <div className="admin-success">{success}<button onClick={() => setSuccess('')}>×</button></div>}

        {loading && <p>Loading...</p>}

        {!loading && (
          <div style={{ display: 'grid', gap: 16 }}>
            {flags.map((flag) => (
              <div key={flag.key} className="admin-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--mono)', fontSize: 14 }}>{flag.key}</h3>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-2)' }}>{flag.description ?? 'No description'}</p>
                  </div>
                  <button
                    className={`admin-btn${flag.enabled ? ' admin-btn--primary' : ''}`}
                    onClick={() => toggle(flag)}
                  >
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ fontSize: 12, color: 'var(--ink-3)', minWidth: 80 }}>Rollout</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={flag.rollout_percentage}
                    onChange={(e) => updateRollout(flag, Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600, minWidth: 40 }}>{flag.rollout_percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  )
}
