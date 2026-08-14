import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ToolDefinition } from '@/lib/tools'

interface AppContextValue {
  onAuthRequired: () => void
  onUpgradeRequired: () => void
  sidebarOpen: boolean
  setSidebarOpen: (value: boolean) => void
  activeTool: ToolDefinition | null
  setActiveTool: (tool: ToolDefinition | null) => void
}

const noop = () => {}

const AppContext = createContext<AppContextValue>({
  onAuthRequired: noop,
  onUpgradeRequired: noop,
  sidebarOpen: false,
  setSidebarOpen: noop,
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
  const [internalActiveTool, setInternalActiveTool] = useState<ToolDefinition | null>(null)

  const value = useMemo(
    () => ({
      onAuthRequired,
      onUpgradeRequired,
      sidebarOpen,
      setSidebarOpen,
      activeTool: controlledActiveTool ?? internalActiveTool,
      setActiveTool: setInternalActiveTool,
    }),
    [onAuthRequired, onUpgradeRequired, sidebarOpen, controlledActiveTool, internalActiveTool]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext(): AppContextValue {
  return useContext(AppContext)
}
