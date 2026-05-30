import { useState } from 'react'
import { useCVAI } from './useCVAI'
import type { CVAIAction } from '../../lib/api'

interface Props {
  action: CVAIAction
  text?: string
  context?: string
  onResult: (result: string) => void
  label?: string
  small?: boolean
}

export default function AIButton({ action, text, context, onResult, label = '✨ AI', small }: Props) {
  const { loading, error, call } = useCVAI()
  const [showError, setShowError] = useState(false)

  const handleClick = async () => {
    setShowError(false)
    const result = await call(action, text, context)
    if (result) {
      onResult(result)
    } else if (error) {
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
    }
  }

  return (
    <div className="cv-ai-btn-wrap">
      <button
        type="button"
        className={`cv-ai-btn ${small ? 'cv-ai-btn--sm' : ''}`}
        onClick={handleClick}
        disabled={loading}
        title="Generate with AI (Pro)"
      >
        {loading ? '⏳' : label}
      </button>
      {showError && <span className="cv-ai-error">{error}</span>}
    </div>
  )
}
