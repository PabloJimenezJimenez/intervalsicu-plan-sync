// Preview page for reviewing and editing extracted training plan

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PlanPreview } from "../components/PlanPreview";
import { StatusBar } from "../components/StatusBar";
import { LoadingState } from "../components/LoadingState";
import { formatWorkoutForIntervalsICU } from "../utils/workout-formatter";

import { uploadWorkoutPlan } from "../utils/intervals-icu";
import { getAPIKey } from "../utils/storage";
import type { TrainingPlan } from "../types/workout";
import "../styles.css";
import "../animations.css";

export const Route = createFileRoute("/preview")({
  component: PreviewPage,
  validateSearch: (search: Record<string, unknown>) => ({
    planData: search.planData as string | undefined,
  }),
});

function PreviewPage() {
  const navigate = useNavigate();
  const { planData } = Route.useSearch();

  // Parse plan data
  const initialPlan: TrainingPlan | null = planData
    ? JSON.parse(decodeURIComponent(planData))
    : null;

  if (!initialPlan) {
    // No plan data, redirect to home
    navigate({ to: "/" });
    return null;
  }

  const [plan, setPlan] = useState<TrainingPlan>(initialPlan);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [paceMapping, setPaceMapping] = useState<Record<string, string>>({});

  const steps = [
    { id: "setup", label: "Setup", completed: true },
    { id: "upload", label: "Upload", completed: true },
    { id: "preview", label: "Preview", completed: false },
    { id: "sync", label: "Sync", completed: false },
  ];

  const handleUpload = async () => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // LOGGING FOR USER VERIFICATION
    console.log("🚀 PREPARING UPLOAD TO INTERVALS.ICU 🚀");
    console.log("Plan Name:", plan.name);
    console.log("Workouts to upload:", plan.workouts.length);
    console.log("Pace Mappings:", paceMapping);

    plan.workouts.forEach((workout) => {
      console.group(`Workout: ${workout.name} (${workout.date})`);
      console.log("Original Description:", workout.description);

      const formatted = formatWorkoutForIntervalsICU(workout, paceMapping);
      console.log(
        "%cPREVIEW OF STRUCTURED WORKOUT DATA:",
        "color: #00ff00; font-weight: bold",
      );
      console.log(formatted);
      console.groupEnd();
    });

    try {
      const apiKey = getAPIKey("intervals");
      if (!apiKey) {
        throw new Error("intervals.icu API key not found");
      }

      // We need to inject the formatted description into the workouts before upload
      // or update uploadWorkoutPlan to accept mappings.
      // For simplicity, let's create a copy of the plan with formatted descriptions
      const planToUpload = {
        ...plan,
        workouts: plan.workouts.map((w) => ({
          ...w,
          description: formatWorkoutForIntervalsICU(w, paceMapping),
        })),
      };

      const result = await uploadWorkoutPlan(
        planToUpload,
        { apiKey },
        (current, total) => {
          setUploadProgress((current / total) * 100);
        },
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      // Navigate to success page
      navigate({
        to: "/success",
        search: {
          planName: plan.name,
          workoutCount: plan.workouts.length.toString(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <header className="page-header animate-fade-in">
          <h1>Review Training Plan</h1>
          <p className="subtitle">
            Review and edit your training plan before uploading to intervals.icu
          </p>
        </header>

        <StatusBar
          steps={steps}
          currentStepId={isUploading ? "sync" : "preview"}
        />

        {!isUploading && (
          <>
            <PlanPreview
              plan={plan}
              onPlanUpdate={setPlan}
              onPaceMappingChange={setPaceMapping}
            />

            <div className="action-bar animate-slide-in-up">
              <button
                onClick={() => navigate({ to: "/" })}
                className="btn-secondary"
              >
                Start Over
              </button>
              <button onClick={handleUpload} className="btn-primary">
                Upload to intervals.icu
              </button>
            </div>

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
          </>
        )}

        {isUploading && (
          <LoadingState
            message="Uploading workouts to intervals.icu..."
            progress={uploadProgress}
            subMessage={`${Math.round(uploadProgress)}% complete`}
          />
        )}
      </div>

      <style>{`
        .action-bar {
          display: flex;
          justify-content: space-between;
          gap: var(--space-md);
          margin-top: var(--space-2xl);
          padding: var(--space-xl);
          background: var(--color-bg-elevated);
          border-radius: var(--radius-lg);
          position: sticky;
          bottom: var(--space-lg);
          box-shadow: var(--shadow-lg);
        }

        .btn-primary,
        .btn-secondary {
          padding: var(--space-md) var(--space-2xl);
          border-radius: var(--radius-md);
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
        }

        .error-banner {
          display: flex;
          gap: var(--space-md);
          padding: var(--space-lg);
          border-radius: var(--radius-lg);
          margin-top: var(--space-xl);
          background: var(--color-error-bg);
          border: 2px solid var(--color-error);
          color: var(--color-error);
        }

        .error-banner svg {
          flex-shrink: 0;
        }

        .error-banner h4 {
          font-family: var(--font-body);
          font-size: var(--text-lg);
          font-weight: var(--weight-semibold);
          margin-bottom: var(--space-xs);
          text-transform: none;
          color: inherit;
        }

        .error-banner p {
          margin: 0;
          color: inherit;
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .action-bar {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
