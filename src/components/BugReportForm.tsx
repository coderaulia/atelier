import { useState } from 'react'
import { submitBugReport } from '../lib/api'
import { TOOLS } from '../lib/tools'

interface BugReportFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  defaultToolId?: string
}

export default function BugReportForm({ onSuccess, onCancel, defaultToolId }: BugReportFormProps) {
  const knownDefault = TOOLS.some((t) => t.id === defaultToolId)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [toolId, setToolId] = useState(knownDefault ? (defaultToolId ?? '') : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await submitBugReport({
        subject,
        description,
        tool_id: toolId || undefined,
      })
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit bug report')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ marginBottom: 8 }}>Bug Report Submitted</h2>
        <p style={{ color: 'var(--ink-3)' }}>Thank you! We'll review your report and get back to you.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, maxWidth: 600 }}>
      <h2 style={{ marginBottom: 8 }}>Report a Bug</h2>
      <p style={{ color: 'var(--ink-3)', marginBottom: 24, fontSize: 14 }}>
        Help us improve by reporting issues you encounter. We'll investigate and keep you updated.
      </p>

      {error && (
        <div style={{ padding: 12, background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: 6, marginBottom: 16, color: 'rgb(220, 38, 38)' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="subject" style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
          Subject *
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief description of the issue"
          required
          minLength={5}
          maxLength={200}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="tool" style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
          Related Tool (optional)
        </label>
        <select
          id="tool"
          value={toolId}
          onChange={(e) => setToolId(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}
        >
          <option value="">-- Select a tool --</option>
          {TOOLS.map((tool) => (
            <option key={tool.id} value={tool.id}>
              {tool.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label htmlFor="description" style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe the issue in detail. Include steps to reproduce if possible."
          required
          minLength={10}
          maxLength={5000}
          rows={8}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
        />
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
          {description.length} / 5000 characters
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="submit"
          disabled={loading}
          style={{ flex: 1, padding: '10px 20px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{ padding: '10px 20px', background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
