import { useState } from 'react';
import BugReportForm from '../../../components/BugReportForm';

export function SupportTab() {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return (
      <div className="account-panel">
        <BugReportForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      </div>
    )
  }

  return (
    <div className="account-panel">
      <h2>Support</h2>
      <p style={{ color: 'var(--ink-2)', marginBottom: 28 }}>
        Need help? Report a bug, ask a question, or reach out via email.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn--accent"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px 22px', height: 'auto', borderRadius: 16 }}
        >
          <span style={{ fontSize: 28, marginBottom: 10 }}>🐛</span>
          <span style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Report a Bug</span>
          <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.8 }}>Something not working? Let us know.</span>
        </button>

        <a
          href="mailto:studio@vanaila.com?subject=Support Request"
          className="btn"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px 22px', height: 'auto', borderRadius: 16, textDecoration: 'none', border: '1px solid var(--border)' }}
        >
          <span style={{ fontSize: 28, marginBottom: 10 }}>✉️</span>
          <span style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--ink)' }}>Email Support</span>
          <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-2)' }}>studio@vanaila.com</span>
        </a>
      </div>

      <div style={{ padding: 16, background: 'var(--bg-2)', borderRadius: 12, fontSize: 13, color: 'var(--ink-2)' }}>
        <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 6 }}>Response times</strong>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 4 }}>
          <li>Bug reports — typically within 24 hours</li>
          <li>Email support — 1–2 business days</li>
          <li>Critical issues — prioritised immediately</li>
        </ul>
      </div>
    </div>
  )
}

