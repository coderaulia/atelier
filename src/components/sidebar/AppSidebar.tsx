import { Link } from 'react-router-dom'
import { TOOLS, getAllCategories, getToolsByCategory } from '@/lib/tools'
import { useAppContext } from '@/context/AppContext'
import SidebarGroup from './SidebarGroup'
import SidebarItem from './SidebarItem'
import SidebarFooter from './SidebarFooter'
import { useState } from 'react'

export default function AppSidebar() {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useAppContext()
  const [query, setQuery] = useState('')

  const normalizedQuery = query.trim().toLowerCase()
  const filteredTools = normalizedQuery
    ? TOOLS.filter((tool) => tool.name.toLowerCase().includes(normalizedQuery))
    : []

  const closeSidebar = () => setSidebarOpen(false)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setQuery('')
    }
  }

  return (
    <>
      <aside className={`app-sidebar ${sidebarOpen ? 'app-sidebar--open' : ''} ${sidebarCollapsed ? 'app-sidebar--collapsed' : ''}`}>
        <div className="app-sidebar__header">
          <Link to="/app/dashboard" className="app-sidebar__brand" onClick={closeSidebar} title="Vanaila Studio">
            <span className="app-sidebar__logo">V</span>
            {!sidebarCollapsed && (
              <span className="app-sidebar__brand-text">
                <strong>Vanaila</strong>
                <small>Studio</small>
              </span>
            )}
          </Link>
          <button
            type="button"
            className="app-sidebar__collapse-btn"
            onClick={() => setSidebarCollapsed((c) => !c)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`app-sidebar__collapse-icon ${sidebarCollapsed ? 'app-sidebar__collapse-icon--collapsed' : ''}`}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="app-sidebar__search">
            <input
              id="app-sidebar-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tools..."
              aria-label="Search tools"
            />
          </div>
        )}

        <nav className="app-sidebar__nav" aria-label="App tools">
          {normalizedQuery ? (
            <div className="app-sidebar__results">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <SidebarItem key={tool.id} tool={tool} onNavigate={closeSidebar} />
                ))
              ) : (
                <p className="app-sidebar__empty">No tools found</p>
              )}
            </div>
          ) : (
            getAllCategories().map((category) => (
              <SidebarGroup
                key={category}
                category={category}
                tools={getToolsByCategory(category)}
                onNavigate={closeSidebar}
              />
            ))
          )}
        </nav>

        <SidebarFooter />
      </aside>

      {sidebarOpen && <button className="app-sidebar__backdrop" onClick={closeSidebar} aria-label="Close sidebar" />}
    </>
  )
}
