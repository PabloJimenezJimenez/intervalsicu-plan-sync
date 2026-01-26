// Loading state component with animated spinner and status messages

import "../styles.css";
import "../animations.css";

interface LoadingStateProps {
  message?: string;
  progress?: number; // 0-100
  subMessage?: string;
}

export function LoadingState({
  message = "Processing...",
  progress,
  subMessage,
}: LoadingStateProps) {
  return (
    <div className="loading-state">
      <div className="loading-content">
        {/* Animated spinner */}
        <div className="spinner-container">
          <div className="spinner animate-glow"></div>
        </div>

        {/* Status message */}
        <div className="loading-text">
          <h3>{message}</h3>
          {subMessage && <p className="text-secondary">{subMessage}</p>}
        </div>

        {/* Progress bar (if provided) */}
        {progress !== undefined && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="progress-label">{Math.round(progress)}%</span>
          </div>
        )}

        {/* Loading dots animation */}
        <div className="loading-dots">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      </div>

      <style>{`
        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: var(--space-2xl);
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xl);
          max-width: 400px;
          text-align: center;
        }

        .spinner-container {
          position: relative;
        }

        .loading-text h3 {
          margin-bottom: var(--space-sm);
          color: var(--color-text-primary);
        }

        .loading-text p {
          font-size: var(--text-sm);
          margin-bottom: 0;
        }

        .progress-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .progress-label {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--color-accent);
          text-align: right;
        }
      `}</style>
    </div>
  );
}
