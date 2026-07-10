import type { ReactNode } from 'react'

interface RowActionsProps {
  children: ReactNode
}

export default function RowActions({ children }: RowActionsProps) {
  return <div className="admin-row-actions">{children}</div>
}

interface RowActionButtonProps {
  onClick: () => void
  title: string
  children: ReactNode
  variant?: 'default' | 'danger' | 'success'
}

export function RowActionButton({ onClick, title, children, variant = 'default' }: RowActionButtonProps) {
  const className = variant === 'default' ? 'admin-btn-icon' : `admin-btn-icon admin-btn-icon--${variant}`
  return (
    <button className={className} onClick={onClick} title={title} aria-label={title}>
      {children}
    </button>
  )
}
