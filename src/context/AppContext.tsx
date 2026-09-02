import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ToolDefinition } from '@/lib/tools'

interface AppContextValue {
  onAuthRequired: () => void
  onUpgradeRequired: () => void
  sidebarOpen: boolean
  setSidebarOpen: (value: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void
  activeTool: ToolDefinition | null
  setActiveTool: (tool: ToolDefinition | null) => void
}

const noop = () => {}

const AppContext = createContext<AppContextValue>({
  onAuthRequired: noop,
  onUpgradeRequired: noop,
  sidebarOpen: false,
  setSidebarOpen: noop,
  sidebarCollapsed: false,
  setSidebarCollapsed: noop,
  activeTool: null,
  setActiveTool: noop,
})

interface AppContextProviderProps {
  children: ReactNode
  onAuthRequired?: () => void
  onUpgradeRequired?: () => void
  activeTool?: ToolDefinition | null
}

export function AppContextProvider({
  children,
  onAuthRequired = noop,
  onUpgradeRequired = noop,
  activeTool: controlledActiveTool,
}: AppContextProviderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() => {
    try {
      return localStorage.getItem('app.sidebarCollapsed') === 'true'
    } catch {
      return false
    }
  })
  const [internalActiveTool, setInternalActiveTool] = useState<ToolDefinition | null>(null)

  const setSidebarCollapsed = (value: boolean | ((prev: boolean) => boolean)) => {
    setSidebarCollapsedState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value
      try {
        localStorage.setItem('app.sidebarCollapsed', String(next))
      } catch {}
      return next
    })
  }

  const value = useMemo(
    () => ({
      onAuthRequired,
      onUpgradeRequired,
      sidebarOpen,
      setSidebarOpen,
      sidebarCollapsed,
      setSidebarCollapsed,
      activeTool: controlledActiveTool ?? internalActiveTool,
      setActiveTool: setInternalActiveTool,
    }),
    [onAuthRequired, onUpgradeRequired, sidebarOpen, sidebarCollapsed, controlledActiveTool, internalActiveTool]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext(): AppContextValue {
  return useContext(AppContext)
}
