// Status bar component showing multi-step progress

import "../styles.css";

interface Step {
  id: string;
  label: string;
  completed: boolean;
}

interface StatusBarProps {
  steps: Step[];
  currentStepId: string;
}

export function StatusBar({ steps, currentStepId }: StatusBarProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <div className="status-bar">
      <div className="steps-container">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStepId;
          const isCompleted = step.completed;
          const isPast = index < currentIndex;

          return (
            <div key={step.id} className="step-wrapper">
              <div
                className={`step ${isCurrent ? "current" : ""} ${isCompleted ? "completed" : ""} ${isPast ? "past" : ""}`}
              >
                <div className="step-indicator">
                  {isCompleted ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M16.667 5L7.5 14.167L3.333 10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span className="step-number">{index + 1}</span>
                  )}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`step-connector ${isPast || isCompleted ? "completed" : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .status-bar {
          background: var(--color-bg-elevated);
          padding: var(--space-lg);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-xl);
        }

        .steps-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .step-wrapper {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          position: relative;
          z-index: 1;
        }

        .step-indicator {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--color-bg-surface);
          border: 2px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-tertiary);
          font-family: var(--font-mono);
          font-weight: var(--weight-bold);
          transition: all var(--transition-base);
        }

        .step.current .step-indicator {
          background: var(--color-accent);
          border-color: var(--color-accent);
          color: var(--color-text-inverse);
          box-shadow: var(--shadow-glow);
        }

        .step.completed .step-indicator {
          background: var(--color-success);
          border-color: var(--color-success);
          color: white;
        }

        .step.past .step-indicator {
          background: var(--color-bg-hover);
          border-color: var(--color-border-hover);
        }

        .step-number {
          font-size: var(--text-sm);
        }

        .step-label {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          text-align: center;
          font-weight: var(--weight-medium);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
        }

        .step.current .step-label {
          color: var(--color-accent);
        }

        .step.completed .step-label,
        .step.past .step-label {
          color: var(--color-text-secondary);
        }

        .step-connector {
          flex: 1;
          height: 2px;
          background: var(--color-border);
          margin: 0 var(--space-sm);
          margin-bottom: var(--space-xl);
          transition: background var(--transition-base);
        }

        .step-connector.completed {
          background: var(--color-success);
        }

        @media (max-width: 768px) {
          .step-label {
            font-size: 10px;
          }

          .step-indicator {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </div>
  );
}
