import { Link, useLocation } from 'react-router-dom'
import type { ToolDefinition } from '@/lib/tools'
import './sidebar.css'

interface SidebarItemProps {
  tool: ToolDefinition
  onNavigate?: () => void
}

export default function SidebarItem({ tool, onNavigate }: SidebarItemProps) {
  const location = useLocation()
  const isActive = location.pathname === tool.appPath || location.pathname.startsWith(tool.appPath + '/')

  return (
    <Link
      to={tool.appPath}
      className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
      onClick={onNavigate}
      title={`${tool.name} — ${tool.description}`}
    >
      <span className="sidebar-item__icon">{tool.icon}</span>
      <span className="sidebar-item__label">{tool.name}</span>
      {tool.badge && (
        <span className={`sidebar-item__badge sidebar-item__badge--${tool.badge}`}>
          {tool.badge}
        </span>
      )}
    </Link>
  )
}
