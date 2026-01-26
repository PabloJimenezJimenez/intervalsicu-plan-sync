// Setup page for API key configuration

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { saveAPIKey, getAPIKey } from "../utils/storage";
import { validateGoogleAIAPIKey } from "../utils/google-ai";
import { validateIntervalsICUAPIKey } from "../utils/intervals-icu";
import "../styles.css";
import "../animations.css";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const [intervalsKey, setIntervalsKey] = useState("");
  const [googleAIKey, setGoogleAIKey] = useState("");
  const [intervalsValid, setIntervalsValid] = useState<boolean | null>(null);
  const [googleAIValid, setGoogleAIValid] = useState<boolean | null>(null);
  const [isTestingIntervals, setIsTestingIntervals] = useState(false);
  const [isTestingGoogleAI, setIsTestingGoogleAI] = useState(false);
  const [showInstructions, setShowInstructions] = useState({
    intervals: false,
    googleai: false,
  });

  useEffect(() => {
    // Load existing keys
    const existingIntervalsKey = getAPIKey("intervals");
    const existingGoogleAIKey = getAPIKey("googleai");

    if (existingIntervalsKey) {
      setIntervalsKey(existingIntervalsKey);
      setIntervalsValid(true);
    }
    if (existingGoogleAIKey) {
      setGoogleAIKey(existingGoogleAIKey);
      setGoogleAIValid(true);
    }
  }, []);

  const handleTestIntervals = async () => {
    if (!intervalsKey.trim()) return;

    setIsTestingIntervals(true);
    setIntervalsValid(null);

    const result = await validateIntervalsICUAPIKey(intervalsKey);

    setIntervalsValid(result.success);
    setIsTestingIntervals(false);

    if (result.success) {
      saveAPIKey("intervals", intervalsKey);
    }
  };

  const handleTestGoogleAI = async () => {
    if (!googleAIKey.trim()) return;

    setIsTestingGoogleAI(true);
    setGoogleAIValid(null);

    const isValid = await validateGoogleAIAPIKey(googleAIKey);

    setGoogleAIValid(isValid);
    setIsTestingGoogleAI(false);

    if (isValid) {
      saveAPIKey("googleai", googleAIKey);
    }
  };

  const handleSaveAndContinue = () => {
    if (intervalsValid && googleAIValid) {
      navigate({ to: "/" });
    }
  };

  const allValid = intervalsValid === true && googleAIValid === true;

  return (
    <div className="page">
      <div className="container content">
        <header className="page-header animate-fade-in">
          <h1>API Configuration</h1>
          <p className="subtitle">
            Configure your intervals.icu and Google AI Studio API keys to get
            started
          </p>
        </header>

        <div className="setup-form animate-scale-in">
          {/* intervals.icu Section */}
          <div className="api-section">
            <div className="section-header">
              <h3>intervals.icu API Key</h3>
              <button
                onClick={() =>
                  setShowInstructions({
                    ...showInstructions,
                    intervals: !showInstructions.intervals,
                  })
                }
                className="btn-instructions"
              >
                {showInstructions.intervals ? "Hide" : "Show"} Instructions
              </button>
            </div>

            {showInstructions.intervals && (
              <div className="instructions animate-slide-in-up">
                <ol>
                  <li>
                    Go to{" "}
                    <a
                      href="https://intervals.icu"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      intervals.icu
                    </a>{" "}
                    and log in
                  </li>
                  <li>Navigate to Settings → Developer Settings</li>
                  <li>Generate a new API key</li>
                  <li>Copy and paste it below</li>
                </ol>
                <p className="note">
                  <strong>Required Permission:</strong> CALENDAR:WRITE
                </p>
              </div>
            )}

            <div className="input-group">
              <input
                type="password"
                value={intervalsKey}
                onChange={(e) => {
                  setIntervalsKey(e.target.value);
                  setIntervalsValid(null);
                }}
                placeholder="Enter intervals.icu API key"
                className="api-input"
              />
              <button
                onClick={handleTestIntervals}
                disabled={!intervalsKey.trim() || isTestingIntervals}
                className="btn-test"
              >
                {isTestingIntervals ? "Testing..." : "Test Connection"}
              </button>
            </div>

            {intervalsValid === true && (
              <div className="status-message success">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M16.667 5L7.5 14.167L3.333 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Connection successful!
              </div>
            )}

            {intervalsValid === false && (
              <div className="status-message error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Invalid API key. Please check and try again.
              </div>
            )}
          </div>

          {/* Google AI Section */}
          <div className="api-section">
            <div className="section-header">
              <h3>Google AI Studio API Key</h3>
              <button
                onClick={() =>
                  setShowInstructions({
                    ...showInstructions,
                    googleai: !showInstructions.googleai,
                  })
                }
                className="btn-instructions"
              >
                {showInstructions.googleai ? "Hide" : "Show"} Instructions
              </button>
            </div>

            {showInstructions.googleai && (
              <div className="instructions animate-slide-in-up">
                <ol>
                  <li>
                    Go to{" "}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google AI Studio
                    </a>{" "}
                    and sign in with your Google account
                  </li>
                  <li>Click "Create API Key"</li>
                  <li>Copy the generated API key</li>
                  <li>Paste it below</li>
                </ol>
                <p className="note">
                  <strong>Free Tier:</strong> Gemini 2.0 Flash with generous
                  limits
                </p>
              </div>
            )}

            <div className="input-group">
              <input
                type="password"
                value={googleAIKey}
                onChange={(e) => {
                  setGoogleAIKey(e.target.value);
                  setGoogleAIValid(null);
                }}
                placeholder="Enter Google AI Studio API key"
                className="api-input"
              />
              <button
                onClick={handleTestGoogleAI}
                disabled={!googleAIKey.trim() || isTestingGoogleAI}
                className="btn-test"
              >
                {isTestingGoogleAI ? "Testing..." : "Test Connection"}
              </button>
            </div>

            {googleAIValid === true && (
              <div className="status-message success">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M16.667 5L7.5 14.167L3.333 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Connection successful!
              </div>
            )}

            {googleAIValid === false && (
              <div className="status-message error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Invalid API key. Please check and try again.
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              onClick={() => navigate({ to: "/" })}
              className="btn-secondary"
            >
              Back
            </button>
            <button
              onClick={handleSaveAndContinue}
              disabled={!allValid}
              className="btn-primary"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .setup-form {
          background: var(--color-bg-elevated);
          border-radius: var(--radius-lg);
          padding: var(--space-2xl);
          max-width: 700px;
          margin: 0 auto;
        }

        .api-section {
          margin-bottom: var(--space-2xl);
          padding-bottom: var(--space-2xl);
          border-bottom: 1px solid var(--color-border);
        }

        .api-section:last-of-type {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-lg);
        }

        .section-header h3 {
          margin-bottom: 0;
        }

        .btn-instructions {
          background: none;
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          padding: var(--space-xs) var(--space-md);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .btn-instructions:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
        }

        .instructions {
          background: var(--color-bg-surface);
          padding: var(--space-lg);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-lg);
          border: 1px solid var(--color-border);
        }

        .instructions ol {
          margin: 0 0 var(--space-md) var(--space-lg);
          padding: 0;
        }

        .instructions li {
          margin-bottom: var(--space-sm);
          color: var(--color-text-secondary);
        }

        .instructions a {
          color: var(--color-accent);
        }

        .note {
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
          background: var(--color-bg-base);
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-sm);
          margin: 0;
        }

        .input-group {
          display: flex;
          gap: var(--space-md);
        }

        .api-input {
          flex: 1;
          background: var(--color-bg-base);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--space-md);
          color: var(--color-text-primary);
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          transition: all var(--transition-base);
        }

        .api-input:focus {
          outline: none;
          border-color: var(--color-accent);
        }

        .btn-test {
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          padding: var(--space-md) var(--space-lg);
          border-radius: var(--radius-md);
          font-weight: var(--weight-semibold);
          cursor: pointer;
          transition: all var(--transition-base);
          white-space: nowrap;
        }

        .btn-test:hover:not(:disabled) {
          border-color: var(--color-accent);
          color: var(--color-accent);
        }

        .btn-test:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .status-message {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-top: var(--space-md);
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
        }

        .status-message.success {
          background: var(--color-success-bg);
          color: var(--color-success);
        }

        .status-message.error {
          background: var(--color-error-bg);
          color: var(--color-error);
        }

        .form-actions {
          display: flex;
          gap: var(--space-md);
          justify-content: flex-end;
          margin-top: var(--space-2xl);
          padding-top: var(--space-xl);
          border-top: 1px solid var(--color-border);
        }

        .btn-primary,
        .btn-secondary {
          padding: var(--space-md) var(--space-2xl);
          border-radius: var(--radius-md);
          font-weight: var(--weight-semibold);
          cursor: pointer;
          transition: all var(--transition-base);
          border: none;
        }

        .btn-primary {
          background: var(--color-accent);
          color: var(--color-text-inverse);
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--color-accent-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--color-bg-surface);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
        }

        .btn-secondary:hover {
          background: var(--color-bg-hover);
        }
      `}</style>
    </div>
  );
}
