import { useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { AppContextProvider } from '@/context/AppContext'
import { useAuth } from '@/hooks/useAuth'
import AppSidebar from '@/components/sidebar/AppSidebar'
import TopBar from '@/components/navigation/TopBar'
import UpgradeModal from '@/components/UpgradeModal'
import { useState } from 'react'
import './app-shell.css'

import { useAppContext } from '@/context/AppContext'

function AppShellContent({ upgradeOpen, setUpgradeOpen }: { upgradeOpen: boolean; setUpgradeOpen: (v: boolean) => void }) {
  const { sidebarCollapsed } = useAppContext()

  return (
    <>
      <div className={`app-shell ${sidebarCollapsed ? 'app-shell--collapsed' : ''}`}>
        <AppSidebar />
        <div className="app-main">
          <TopBar />
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>
      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  )
}

function AppShellInner() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="app-shell app-shell--loading">
        <div className="app-shell__loader">Loading…</div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <AppContextProvider
      onAuthRequired={() => navigate('/login')}
      onUpgradeRequired={() => setUpgradeOpen(true)}
    >
      <AppShellContent upgradeOpen={upgradeOpen} setUpgradeOpen={setUpgradeOpen} />
    </AppContextProvider>
  )
}

export default function AppShell() {
  return <AppShellInner />
}
