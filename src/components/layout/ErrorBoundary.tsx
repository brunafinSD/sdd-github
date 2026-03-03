// T094: Error boundary — captura erros de renderização sem derrubar o app inteiro

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Container } from './Container'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-brand-gray-light flex items-center justify-center">
          <Container maxWidth="sm">
            <div className="bg-white rounded-2xl shadow-md p-8 text-center space-y-4">
              <p className="text-4xl">⚠️</p>
              <h1 className="text-xl font-bold text-brand-gray-dark">Algo deu errado</h1>
              <p className="text-sm text-gray-500">
                {this.state.error?.message ?? 'Ocorreu um erro inesperado.'}
              </p>
              <button
                onClick={this.handleReset}
                className="mt-2 px-6 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg hover:brightness-110 transition-colors"
              >
                Voltar ao início
              </button>
            </div>
          </Container>
        </div>
      )
    }

    return this.props.children
  }
}
