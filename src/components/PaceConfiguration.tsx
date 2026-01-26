import { useState, useEffect } from "react";
import type { TrainingPlan } from "../types/workout";
import "../styles.css";

interface PaceConfigurationProps {
  plan: TrainingPlan;
  paceMapping: Record<string, string>;
  onPaceMappingChange: (mapping: Record<string, string>) => void;
  onClose: () => void;
}

export function PaceConfiguration({
  plan,
  paceMapping,
  onPaceMappingChange,
  onClose,
}: PaceConfigurationProps) {
  // Extract unique intensities from the plan
  const [intensities, setIntensities] = useState<string[]>([]);

  useEffect(() => {
    const uniqueIntensities = new Set<string>();

    plan.workouts.forEach((workout) => {
      // Check main workout intensity if available
      if (workout.intensity) {
        uniqueIntensities.add(workout.intensity);
      }

      // Check interval intensities
      if (workout.intervals) {
        workout.intervals.forEach((interval) => {
          if (interval.intensity) uniqueIntensities.add(interval.intensity);
          if (interval.recoveryIntensity)
            uniqueIntensities.add(interval.recoveryIntensity);
        });
      }
    });

    // Sort alphabetically but put common ones first
    const sorted = Array.from(uniqueIntensities).sort((a, b) => {
      const priority = ["easy", "recovery", "warmup", "cooldown"];
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const aIdx = priority.findIndex((p) => aLower.includes(p));
      const bIdx = priority.findIndex((p) => bLower.includes(p));

      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.localeCompare(b);
    });

    setIntensities(sorted);
  }, [plan]);

  const handleMappingChange = (intensity: string, value: string) => {
    onPaceMappingChange({
      ...paceMapping,
      [intensity]: value,
    });
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content animate-slide-in-up">
        <div className="modal-header">
          <h2>Configure Paces & Intensities</h2>
          <button onClick={onClose} className="btn-close">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <p className="description">
            Map the intensities found in your plan to specific values for
            intervals.icu.
            <br />
            <strong>Examples:</strong> <code>6:50-7:10/km</code>,{" "}
            <code>Z2</code>, <code>90-95% LTHR</code>
          </p>

          <div className="pace-list">
            {intensities.map((intensity) => (
              <div key={intensity} className="pace-item">
                <label className="intensity-label">{intensity}</label>
                <div className="input-with-arrow">
                  <span>→</span>
                  <input
                    type="text"
                    value={paceMapping[intensity] || ""}
                    placeholder={`e.g. 5:00-5:15/km`}
                    onChange={(e) =>
                      handleMappingChange(intensity, e.target.value)
                    }
                    className="pace-input"
                  />
                </div>
              </div>
            ))}

            {intensities.length === 0 && (
              <p className="empty-message">
                No specific intensities found in this plan.
              </p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: var(--space-md);
        }

        .modal-content {
          background: var(--color-bg-elevated);
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-2xl);
          border: 1px solid var(--color-border);
        }

        .modal-header {
          padding: var(--space-lg);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: var(--text-xl);
          font-weight: var(--weight-bold);
        }

        .btn-close {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: var(--space-xs);
          border-radius: var(--radius-full);
          transition: all var(--transition-fast);
        }

        .btn-close:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .modal-body {
          padding: var(--space-lg);
          overflow-y: auto;
        }

        .description {
          color: var(--color-text-secondary);
          margin-bottom: var(--space-lg);
          font-size: var(--text-sm);
          line-height: 1.5;
        }

        .description code {
          background: var(--color-bg-surface);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          color: var(--color-accent);
        }

        .pace-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .pace-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          background: var(--color-bg-surface);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }

        .intensity-label {
          flex: 1;
          font-weight: var(--weight-semibold);
          color: var(--color-text-primary);
        }

        .input-with-arrow {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          flex: 2;
        }

        .input-with-arrow span {
          color: var(--color-text-tertiary);
        }

        .pace-input {
          width: 100%;
          padding: var(--space-sm) var(--space-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-bg-elevated);
          color: var(--color-text-primary);
          font-family: var(--font-mono);
          transition: all var(--transition-fast);
        }

        .pace-input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 2px rgba(255, 107, 0, 0.1);
        }

        .modal-footer {
          padding: var(--space-lg);
          border-top: 1px solid var(--color-border);
          display: flex;
          justify-content: flex-end;
        }

        .empty-message {
          text-align: center;
          color: var(--color-text-tertiary);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
