import { useCallback, useState } from 'react'
import { generateCVAI, type CVAIAction } from '../../lib/api'
import { usePlan } from '../../hooks/usePlan'

interface UseCVAIResult {
  loading: boolean
  error: string | null
  call: (action: CVAIAction, text?: string, context?: string) => Promise<string | null>
}

export function useCVAI(): UseCVAIResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isPro } = usePlan()

  const call = useCallback(async (action: CVAIAction, text?: string, context?: string): Promise<string | null> => {
    if (!isPro) {
      setError('Upgrade to Pro to use AI features')
      return null
    }
    setLoading(true)
    setError(null)
    try {
      const { result } = await generateCVAI({ action, text, context })
      return result
    } catch (err: any) {
      setError(err.message ?? 'AI call failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [isPro])

  return { loading, error, call }
}
