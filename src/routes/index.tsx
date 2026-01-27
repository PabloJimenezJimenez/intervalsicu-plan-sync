import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PDFUploader } from "../components/PDFUploader";
import { LoadingState } from "../components/LoadingState";
import { StatusBar } from "../components/StatusBar";
import { DatePicker } from "../components/DatePicker";
import { hasAPIKeys } from "../utils/storage";
import { processPDFFile } from "../utils/pdf-parser";
import { extractPlanFromPDF } from "../utils/google-ai";
import { getAPIKey } from "../utils/storage";
import "../styles.css";
import "../animations.css";

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(getTodayDate());

  const apiKeys = hasAPIKeys();

  const steps = [
    {
      id: "setup",
      label: "Setup",
      completed: apiKeys.intervals && apiKeys.googleai,
    },
    { id: "upload", label: "Upload", completed: false },
    { id: "preview", label: "Preview", completed: false },
    { id: "sync", label: "Sync", completed: false },
  ];

  const handleFileSelected = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setProcessingMessage("Processing PDF file...");

    try {
      // Process PDF file
      const pdfFile = await processPDFFile(file);

      setProcessingMessage("Extracting training plan using AI...");

      // Get Google AI API key
      const googleAIKey = getAPIKey("googleai");
      if (!googleAIKey) {
        throw new Error("Google AI API key not found");
      }

      // Extract plan using Google AI with the selected start date
      const result = await extractPlanFromPDF(
        pdfFile.base64,
        googleAIKey,
        pdfFile.filename,
        startDate,
      );

      if (!result.success) {
        // Check if it's a rate limit error
        if (
          result.error?.includes("quota") ||
          result.error?.includes("rate limit")
        ) {
          throw new Error(
            "Google AI rate limit exceeded. Please wait 25-60 seconds and try again, or try with a smaller PDF file.",
          );
        }
        throw new Error(result.error);
      }

      // Navigate to preview with the extracted plan
      navigate({
        to: "/preview",
        search: { planData: encodeURIComponent(JSON.stringify(result.data)) },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process PDF");
      setIsProcessing(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <header className="page-header animate-fade-in">
          <h1>Training Plan Importer</h1>
          <p className="subtitle">
            Upload your PDF training plan and sync it to your Garmin device via
            intervals.icu
          </p>
        </header>

        {/* Status Bar */}
        <StatusBar
          steps={steps}
          currentStepId={isProcessing ? "upload" : "setup"}
        />

        {/* Setup Check */}
        {(!apiKeys.intervals || !apiKeys.googleai) && (
          <div className="warning-banner animate-slide-in-up">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <h4>API Keys Required</h4>
              <p>
                You need to configure your API keys before uploading a plan.
              </p>
              <button
                onClick={() => navigate({ to: "/setup" })}
                className="btn-setup"
              >
                Go to Setup
              </button>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {apiKeys.intervals && apiKeys.googleai && !isProcessing && (
          <div className="upload-section animate-scale-in">
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              label="Plan Start Date"
              minDate={getTodayDate()}
            />
            <PDFUploader
              onFileSelected={handleFileSelected}
              isProcessing={isProcessing}
            />

            {error && (
              <div className="error-banner animate-slide-in-up">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 8v4M12 16h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <div>
                  <h4>Upload Failed</h4>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <LoadingState
            message={processingMessage}
            subMessage="This may take up to 30 seconds..."
          />
        )}

        {/* Quick Links */}
        {!isProcessing && (
          <div className="quick-links">
            <a
              href="https://intervals.icu"
              target="_blank"
              rel="noopener noreferrer"
              className="quick-link"
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
              intervals.icu
            </a>
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="quick-link"
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
              OpenRouter
            </a>
          </div>
        )}
      </div>

      <style>{`
        .page {
          min-height: 100vh;
          padding: var(--space-2xl) 0;
        }

        .page-header {
          text-align: center;
          margin-bottom: var(--space-3xl);
        }

        .page-header h1 {
          margin-bottom: var(--space-md);
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: var(--text-lg);
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        .warning-banner,
        .error-banner {
          display: flex;
          gap: var(--space-md);
          padding: var(--space-lg);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-xl);
        }

        .warning-banner {
          background: var(--color-warning-bg);
          border: 2px solid var(--color-warning);
          color: var(--color-warning);
        }

        .error-banner {
          background: var(--color-error-bg);
          border: 2px solid var(--color-error);
          color: var(--color-error);
        }

        .warning-banner svg,
        .error-banner svg {
          flex-shrink: 0;
        }

        .warning-banner h4,
        .error-banner h4 {
          font-family: var(--font-body);
          font-size: var(--text-lg);
          font-weight: var(--weight-semibold);
          margin-bottom: var(--space-xs);
          text-transform: none;
          color: inherit;
        }

        .warning-banner p,
        .error-banner p {
          margin-bottom: var(--space-md);
          color: inherit;
          opacity: 0.9;
        }

        .btn-setup {
          background: var(--color-warning);
          color: var(--color-text-inverse);
          border: none;
          padding: var(--space-sm) var(--space-lg);
          border-radius: var(--radius-md);
          font-weight: var(--weight-semibold);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .btn-setup:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px var(--color-warning);
        }

        .upload-section {
          margin-bottom: var(--space-2xl);
        }

        .quick-links {
          display: flex;
          justify-content: center;
          gap: var(--space-lg);
          margin-top: var(--space-2xl);
        }

        .quick-link {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-lg);
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: all var(--transition-base);
          font-size: var(--text-sm);
        }

        .quick-link:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
