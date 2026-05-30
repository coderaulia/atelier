import { useState, useEffect, useCallback } from 'react'
import { getUsage, incrementUsage, getAnonUsage, incrementAnonUsage, UsageLimitError } from '../lib/api'
import { getAuthToken } from '../lib/auth'

const ANON_LIMIT = 1
const FREE_LIMIT = 3

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export interface ToolLimitResult {
  canUse: boolean
  used: number
  limit: number | null
  reset_at: number
  has_watermark: boolean
  credits_available?: number
  isLoading: boolean
  increment: () => Promise<boolean>
}

export function useToolLimit(toolId: string): ToolLimitResult {
  const token = getAuthToken()
  const isAuthed = !!token
  const tomorrow = Math.floor(new Date(`${todayStr()}T24:00:00.000Z`).getTime() / 1000)

  const [used, setUsed] = useState<number>(0)
  const [limit, setLimit] = useState<number | null>(isAuthed ? FREE_LIMIT : ANON_LIMIT)
  const [resetAt, setResetAt] = useState<number>(tomorrow)
  const [hasWatermark, setHasWatermark] = useState<boolean>(!isAuthed)
  const [creditsAvailable, setCreditsAvailable] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(isAuthed)

  useEffect(() => {
    if (!isAuthed) {
      setIsLoading(true)
      getAnonUsage(toolId)
        .then((status) => {
          setUsed(status.used)
          setLimit(status.limit)
          setResetAt(status.reset_at)
          setHasWatermark(Boolean(status.has_watermark))
        })
        .catch(() => {
          setUsed(ANON_LIMIT)
          setLimit(ANON_LIMIT)
          setHasWatermark(true)
        })
        .finally(() => setIsLoading(false))
      return
    }

    setIsLoading(true)
    getUsage(toolId, token)
      .then((status) => {
        setUsed(status.used)
        setLimit(status.limit)
        setResetAt(status.reset_at)
        setHasWatermark(Boolean(status.has_watermark))
        setCreditsAvailable(status.credits_available)
      })
      .catch(() => {
        setUsed(0)
        setLimit(FREE_LIMIT)
        setHasWatermark(true)
        setCreditsAvailable(undefined)
      })
      .finally(() => setIsLoading(false))
  }, [toolId, isAuthed, token])

  const increment = useCallback(async (): Promise<boolean> => {
    if (!isAuthed) {
      try {
        const result = await incrementAnonUsage(toolId)
        setUsed(result.used)
        setLimit(result.limit)
        setResetAt(result.reset_at)
        setHasWatermark(Boolean(result.has_watermark))
        return true
      } catch (err) {
        if (err instanceof UsageLimitError) {
          setUsed(err.used)
          return false
        }
        throw err
      }
    }

    try {
      const result = await incrementUsage(toolId, token!)
      setUsed(result.used)
      setLimit(result.limit)
      setResetAt(result.reset_at)
      setHasWatermark(Boolean(result.has_watermark))
      setCreditsAvailable(result.credits_available)
      return true
    } catch (err) {
      if (err instanceof UsageLimitError) {
        setUsed(err.used)
        return false
      }
      throw err
    }
  }, [toolId, isAuthed, token])

  return {
    canUse: limit === null || used < limit,
    used,
    limit,
    reset_at: resetAt,
    has_watermark: hasWatermark,
    credits_available: creditsAvailable,
    isLoading,
    increment,
  }
}
