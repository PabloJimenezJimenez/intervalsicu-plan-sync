// Error boundary component for graceful error handling

import { Component, ErrorInfo, ReactNode } from "react";
import "../styles.css";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 8v4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
            </div>

            <h2>Something Went Wrong</h2>
            <p className="error-message">{this.state.error.message}</p>

            <div className="error-actions">
              <button onClick={this.handleRetry} className="btn-primary">
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error.stack}</pre>
              </details>
            )}
          </div>

          <style>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: var(--space-2xl);
            }

            .error-content {
              max-width: 500px;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: var(--space-lg);
            }

            .error-icon {
              color: var(--color-error);
              animation: pulse 2s ease-in-out infinite;
            }

            .error-content h2 {
              color: var(--color-text-primary);
              margin-bottom: 0;
            }

            .error-message {
              color: var(--color-text-secondary);
              background: var(--color-error-bg);
              padding: var(--space-md);
              border-radius: var(--radius-md);
              border: 1px solid var(--color-error);
              font-family: var(--font-mono);
              font-size: var(--text-sm);
            }

            .error-actions {
              display: flex;
              gap: var(--space-md);
              margin-top: var(--space-md);
            }

            .btn-primary,
            .btn-secondary {
              padding: var(--space-md) var(--space-xl);
              border-radius: var(--radius-md);
              font-family: var(--font-body);
              font-weight: var(--weight-semibold);
              font-size: var(--text-base);
              cursor: pointer;
              transition: all var(--transition-base);
              border: none;
            }

            .btn-primary {
              background: var(--color-accent);
              color: var(--color-text-inverse);
            }

            .btn-primary:hover {
              background: var(--color-accent-hover);
              transform: translateY(-2px);
              box-shadow: var(--shadow-glow);
            }

            .btn-secondary {
              background: var(--color-bg-surface);
              color: var(--color-text-primary);
              border: 1px solid var(--color-border);
            }

            .btn-secondary:hover {
              background: var(--color-bg-hover);
              border-color: var(--color-border-hover);
            }

            .error-details {
              margin-top: var(--space-lg);
              text-align: left;
              width: 100%;
              background: var(--color-bg-surface);
              padding: var(--space-md);
              border-radius: var(--radius-md);
              border: 1px solid var(--color-border);
            }

            .error-details summary {
              cursor: pointer;
              font-weight: var(--weight-semibold);
              color: var(--color-text-secondary);
              margin-bottom: var(--space-sm);
            }

            .error-details pre {
              font-family: var(--font-mono);
              font-size: var(--text-xs);
              color: var(--color-text-tertiary);
              overflow-x: auto;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}
