// Success page after successful upload

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { StatusBar } from "../components/StatusBar";
import "../styles.css";
import "../animations.css";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
  validateSearch: (search: Record<string, unknown>) => ({
    planName: search.planName as string | undefined,
    workoutCount: search.workoutCount as string | undefined,
  }),
});

function SuccessPage() {
  const navigate = useNavigate();
  const { planName, workoutCount } = Route.useSearch();

  const steps = [
    { id: "setup", label: "Setup", completed: true },
    { id: "upload", label: "Upload", completed: true },
    { id: "preview", label: "Preview", completed: true },
    { id: "sync", label: "Sync", completed: true },
  ];

  return (
    <div className="page">
      <div className="container content">
        <StatusBar steps={steps} currentStepId="sync" />

        <div className="success-content animate-scale-in">
          {/* Success icon with glow animation */}
          <div className="success-icon animate-glow">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1>Success!</h1>
          <p className="success-message">
            Your training plan has been uploaded to intervals.icu and will
            automatically sync to your Garmin device.
          </p>

          {/* Upload summary */}
          <div className="upload-summary">
            <div className="summary-item">
              <span className="summary-label">Plan Name</span>
              <span className="summary-value">
                {planName || "Training Plan"}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Workouts Uploaded</span>
              <span className="summary-value">{workoutCount || "0"}</span>
            </div>
          </div>

          {/* Next steps */}
          <div className="next-steps">
            <h3>Next Steps</h3>
            <ol>
              <li>
                <strong>View on intervals.icu:</strong> Open the intervals.icu
                app or website to see your uploaded plan
              </li>
              <li>
                <strong>Sync to Garmin:</strong> The workouts will automatically
                sync to your Garmin device via the intervals.icu integration
              </li>
              <li>
                <strong>Verify on Watch:</strong> Check your Garmin watch to
                ensure all workouts are visible
              </li>
            </ol>
          </div>

          {/* Action buttons */}
          <div className="action-buttons">
            <a
              href="https://intervals.icu/calendar"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-view-intervals"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              View on intervals.icu
            </a>

            <button
              onClick={() => navigate({ to: "/" })}
              className="btn-upload-another"
            >
              Upload Another Plan
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .success-content {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .success-icon {
          color: var(--color-success);
          margin: 0 auto var(--space-2xl);
          display: inline-block;
        }

        .success-content h1 {
          color: var(--color-success);
          margin-bottom: var(--space-lg);
        }

        .success-message {
          font-size: var(--text-lg);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-2xl);
        }

        .upload-summary {
          background: var(--color-bg-elevated);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          margin-bottom: var(--space-2xl);
          display: flex;
          gap: var(--space-2xl);
          justify-content: center;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .summary-label {
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
          color: var(--color-text-tertiary);
          font-weight: var(--weight-semibold);
        }

        .summary-value {
          font-size: var(--text-2xl);
          font-family: var(--font-display);
          color: var(--color-accent);
          text-transform: uppercase;
        }

        .next-steps {
          background: var(--color-bg-elevated);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          margin-bottom: var(--space-2xl);
          text-align: left;
        }

        .next-steps h3 {
          margin-bottom: var(--space-lg);
          text-align: center;
        }

        .next-steps ol {
          margin: 0;
          padding-left: var(--space-xl);
        }

        .next-steps li {
          margin-bottom: var(--space-md);
          color: var(--color-text-secondary);
          line-height: var(--leading-relaxed);
        }

        .next-steps li:last-child {
          margin-bottom: 0;
        }

        .next-steps strong {
          color: var(--color-text-primary);
        }

        .action-buttons {
          display: flex;
          gap: var(--space-md);
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-view-intervals,
        .btn-upload-another {
          display: inline-flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-xl);
          border-radius: var(--radius-md);
          font-weight: var(--weight-semibold);
          cursor: pointer;
          transition: all var(--transition-base);
          text-decoration: none;
          border: none;
          font-family: var(--font-body);
          font-size: var(--text-base);
        }

        .btn-view-intervals {
          background: var(--color-accent);
          color: var(--color-text-inverse);
        }

        .btn-view-intervals:hover {
          background: var(--color-accent-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow);
        }

        .btn-upload-another {
          background: var(--color-bg-surface);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
        }

        .btn-upload-another:hover {
          background: var(--color-bg-hover);
          border-color: var(--color-border-hover);
        }

        @media (max-width: 768px) {
          .upload-summary {
            flex-direction: column;
            gap: var(--space-lg);
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-view-intervals,
          .btn-upload-another {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
