import { useEffect, useState } from 'react'
import './toast.css'

export type ToastType = 'error' | 'warning' | 'success' | 'info'

export interface ToastProps {
  message: string | null
  type?: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'error', onClose, duration = 5000 }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) return
    setVisible(true)
    const timer = window.setTimeout(() => {
      setVisible(false)
      onClose()
    }, duration)
    return () => window.clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message || !visible) return null

  return (
    <div className={`toast toast--${type}`} role="status" aria-live="polite">
      <span className="toast__icon">{type === 'error' ? '⚠️' : type === 'success' ? '✓' : 'ℹ️'}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  )
}
