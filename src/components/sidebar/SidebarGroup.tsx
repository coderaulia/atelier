import { useEffect, useState } from 'react'
import type { ToolCategory, ToolDefinition } from '@/lib/tools'
import { TOOL_CATEGORIES } from '@/lib/tools'
import SidebarItem from './SidebarItem'

interface SidebarGroupProps {
  category: ToolCategory
  tools: ToolDefinition[]
  onNavigate?: () => void
}

const STORAGE_KEY = 'vs_sidebar_collapsed'

function readCollapsed(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeCollapsed(value: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export default function SidebarGroup({ category, tools, onNavigate }: SidebarGroupProps) {
  const categoryMeta = TOOL_CATEGORIES[category]
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    setIsCollapsed(readCollapsed()[category] ?? false)
  }, [category])

  if (tools.length === 1) {
    return <SidebarItem tool={tools[0]} onNavigate={onNavigate} />
  }

  const toggle = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    const collapsed = readCollapsed()
    collapsed[category] = next
    writeCollapsed(collapsed)
  }

  return (
    <div className="sidebar-group">
      <button className="sidebar-group__header" type="button" onClick={toggle}>
        <span className="sidebar-group__icon">{categoryMeta.icon}</span>
        <span className="sidebar-group__label">{categoryMeta.label}</span>
        <span className={`sidebar-group__chevron ${isCollapsed ? 'is-collapsed' : ''}`}>⌄</span>
      </button>
      {!isCollapsed && (
        <div className="sidebar-group__items">
          {tools.map((tool) => (
            <SidebarItem key={tool.id} tool={tool} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  )
}
