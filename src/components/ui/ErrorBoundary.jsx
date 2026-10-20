import React, { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          className={`rounded-[14px] bg-red-500/[0.04] border border-red-500/20 p-5 flex flex-col items-center justify-center text-center gap-3 font-sans backdrop-blur-md ${this.props.className || ''}`}
          style={{ minHeight: this.props.minHeight || '160px' }}
        >
          <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle size={18} />
          </div>

          <div className="max-w-[280px]">
            <p className="text-xs font-semibold text-slate-200">
              {this.props.title || 'Widget encountered an error'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 font-mono">
              {this.state.error?.message || 'Failed to render'}
            </p>
          </div>

          <button
            onClick={this.handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
