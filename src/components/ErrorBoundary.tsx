import React from 'react'
import '../components/toast.css'

interface Props {
  children: React.ReactNode
  title?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__card">
            <div className="error-boundary__icon">💥</div>
            <div className="error-boundary__title">
              {this.props.title || 'Something went wrong'}
            </div>
            <div className="error-boundary__text">
              {this.state.error?.message || 'An unexpected error occurred. Try a different file.'}
            </div>
            <button
              className="error-boundary__btn"
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                window.location.reload()
              }}
            >
              Try a different file
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
