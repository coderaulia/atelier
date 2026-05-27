import { useState, useEffect, useCallback } from 'react'
import { getUsage, incrementUsage, UsageLimitError } from '../lib/api'

const ANON_LIMIT = 2
const FREE_LIMIT = 5

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function lsKey(toolId: string): string {
  return `usage_${toolId}_${todayStr()}`
}

function lsGet(toolId: string): number {
  return parseInt(localStorage.getItem(lsKey(toolId)) ?? '0', 10)
}

function lsSet(toolId: string, count: number): void {
  localStorage.setItem(lsKey(toolId), String(count))
}

export interface ToolLimitResult {
  canUse: boolean
  used: number
  limit: number
  isLoading: boolean
  increment: () => Promise<boolean>
}

export function useToolLimit(toolId: string): ToolLimitResult {
  const token = localStorage.getItem('auth_token')
  const isAuthed = !!token

  const [used, setUsed] = useState<number>(0)
  const [limit, setLimit] = useState<number>(isAuthed ? FREE_LIMIT : ANON_LIMIT)
  const [isLoading, setIsLoading] = useState<boolean>(isAuthed)

  useEffect(() => {
    if (!isAuthed) {
      setUsed(lsGet(toolId))
      setLimit(ANON_LIMIT)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    getUsage(toolId, token)
      .then(({ used, limit }) => {
        setUsed(used)
        setLimit(limit ?? FREE_LIMIT)
        lsSet(toolId, used)
      })
      .catch(() => {
        setUsed(lsGet(toolId))
      })
      .finally(() => setIsLoading(false))
  }, [toolId, isAuthed, token])

  const increment = useCallback(async (): Promise<boolean> => {
    if (!isAuthed) {
      const current = lsGet(toolId)
      if (current >= ANON_LIMIT) return false
      const next = current + 1
      lsSet(toolId, next)
      setUsed(next)
      return true
    }

    try {
      const result = await incrementUsage(toolId, token!)
      setUsed(result.used)
      lsSet(toolId, result.used)
      return true
    } catch (err) {
      if (err instanceof UsageLimitError) {
        setUsed(err.used)
        lsSet(toolId, err.used)
        return false
      }
      throw err
    }
  }, [toolId, isAuthed, token])

  return { canUse: used < limit, used, limit, isLoading, increment }
}
