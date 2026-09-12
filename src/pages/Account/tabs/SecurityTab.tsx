import { useState, useEffect } from 'react';
import { changePassword, getSessions, signOutAll, deleteAccount, type Session } from '../../../lib/api';
import { clearAuth } from '../../../lib/auth';

export function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [currentPasswordEditable, setCurrentPasswordEditable] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [showDanger, setShowDanger] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  useEffect(() => {
    getSessions().then((data) => setSessions(data.sessions)).catch(() => {})
  }, [])

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setMessage('New password must be at least 8 characters')
      return
    }
    try {
      await changePassword(currentPassword, newPassword)
      setMessage('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function handleSignOutAll() {
    try {
      await signOutAll()
      setMessage('Signed out all other devices')
      getSessions().then((data) => setSessions(data.sessions))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') {
      setMessage('Type DELETE to confirm')
      return
    }
    try {
      await deleteAccount()
      clearAuth()
      window.location.href = '/'
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed')
    }
  }

  return (
    <div className="account-panel">
      <h2>Change password</h2>
      <form autoComplete="off" onSubmit={(event) => event.preventDefault()}>
      <div className="account-field">
        <label>Current password</label>
        <input
          type="password"
          name="security-current-password"
          autoComplete="off"
          readOnly={!currentPasswordEditable}
          value={currentPassword}
          onFocus={() => setCurrentPasswordEditable(true)}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className="account-field">
        <label>New password</label>
        <input
          type="password"
          name="new-password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="account-field">
        <label>Confirm new password</label>
        <input
          type="password"
          name="confirm-password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      {message && <div className="account-message">{message}</div>}
      <button onClick={handleChangePassword} className="btn btn--accent">Change password</button>

      <h3 style={{ marginTop: 40 }}>Active sessions</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>{sessions.length} active session(s)</p>
      <button onClick={handleSignOutAll} className="btn">Sign out all other devices</button>

      <h3 style={{ marginTop: 40 }}>Danger zone</h3>
      <button onClick={() => setShowDanger(!showDanger)} className="btn">{showDanger ? 'Hide' : 'Show'} danger zone</button>
      {showDanger && (
        <div style={{ marginTop: 16, padding: 16, border: '1px solid rgba(199,47,47,.3)', borderRadius: 12, background: 'rgba(199,47,47,.05)' }}>
          <h4 style={{ margin: '0 0 8px', color: '#b52a2a' }}>Delete account</h4>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 12px' }}>This will permanently delete your account in 30 days. You can cancel deletion by logging back in before then.</p>
          <div className="account-field">
            <label>Type DELETE to confirm</label>
            <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
          </div>
          <button onClick={handleDeleteAccount} className="btn" style={{ background: '#b52a2a', color: '#fff' }}>Delete my account</button>
        </div>
      )}
      </form>
    </div>
  )
}

