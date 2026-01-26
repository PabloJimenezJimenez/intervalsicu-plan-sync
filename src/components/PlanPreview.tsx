// ... (imports)
import { useState } from "react";
import type { TrainingPlan, Workout, WorkoutType } from "../types/workout";
import { WorkoutRow } from "./WorkoutRow";
import { generateWorkoutId } from "../utils/workout-validator";
import { PaceConfiguration } from "./PaceConfiguration";
import "../styles.css";
import "../animations.css";

interface PlanPreviewProps {
  plan: TrainingPlan;
  onPlanUpdate: (plan: TrainingPlan) => void;
  // Make pace mapping available to parent for upload
  onPaceMappingChange?: (mapping: Record<string, string>) => void;
}

export function PlanPreview({
  plan,
  onPlanUpdate,
  onPaceMappingChange,
}: PlanPreviewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<WorkoutType | "all">("all");
  const [showPaceConfig, setShowPaceConfig] = useState(false);
  const [paceMapping, setPaceMapping] = useState<Record<string, string>>({});

  const handlePaceMappingChange = (newMapping: Record<string, string>) => {
    setPaceMapping(newMapping);
    if (onPaceMappingChange) {
      onPaceMappingChange(newMapping);
    }
  };

  // ... (existing handlers: handleWorkoutUpdate, handleWorkoutDelete, handleAddWorkout, handlePlanNameChange, handleStartDateChange)
  // Need to include them here or use ReplacementChunks to keep them

  const handleWorkoutUpdate = (updatedWorkout: Workout) => {
    const updatedWorkouts = plan.workouts.map((w) =>
      w.id === updatedWorkout.id ? updatedWorkout : w,
    );
    onPlanUpdate({ ...plan, workouts: updatedWorkouts });
  };

  const handleWorkoutDelete = (id: string) => {
    const updatedWorkouts = plan.workouts.filter((w) => w.id !== id);
    onPlanUpdate({ ...plan, workouts: updatedWorkouts });
  };

  const handleAddWorkout = () => {
    const lastWorkout = plan.workouts[plan.workouts.length - 1];
    const lastDate = lastWorkout ? new Date(lastWorkout.date) : new Date();
    lastDate.setDate(lastDate.getDate() + 1);

    const newWorkout: Workout = {
      id: generateWorkoutId(),
      date: lastDate.toISOString().split("T")[0],
      type: "run",
      name: "New Workout",
      description: "Add workout details here",
    };

    onPlanUpdate({ ...plan, workouts: [...plan.workouts, newWorkout] });
  };

  const handlePlanNameChange = (name: string) => {
    onPlanUpdate({ ...plan, name });
  };

  const handleStartDateChange = (newStartDate: string) => {
    // Calculate the difference in days between old and new start dates
    const oldStart = new Date(plan.startDate);
    const newStart = new Date(newStartDate);
    const daysDiff = Math.round(
      (newStart.getTime() - oldStart.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Adjust all workout dates by the same offset
    const updatedWorkouts = plan.workouts.map((workout) => {
      const workoutDate = new Date(workout.date);
      workoutDate.setDate(workoutDate.getDate() + daysDiff);
      return {
        ...workout,
        date: workoutDate.toISOString().split("T")[0],
      };
    });

    // Calculate new end date
    const sortedDates = updatedWorkouts
      .map((w) => new Date(w.date))
      .sort((a, b) => a.getTime() - b.getTime());
    const newEndDate =
      sortedDates.length > 0
        ? sortedDates[sortedDates.length - 1].toISOString().split("T")[0]
        : newStartDate;

    onPlanUpdate({
      ...plan,
      startDate: newStartDate,
      endDate: newEndDate,
      workouts: updatedWorkouts,
    });
  };

  // Filter workouts
  const filteredWorkouts = plan.workouts.filter((workout) => {
    const matchesSearch =
      searchTerm === "" ||
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || workout.type === filterType;

    return matchesSearch && matchesType;
  });

  // Sort by date
  const sortedWorkouts = [...filteredWorkouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="plan-preview">
      {/* Plan Header */}
      <div className="plan-header">
        <input
          type="text"
          value={plan.name}
          onChange={(e) => handlePlanNameChange(e.target.value)}
          className="plan-name-input"
        />
        <div className="plan-meta">
          <div className="meta-date-range">
            <span className="date-label">📅 Start:</span>
            <input
              type="date"
              value={plan.startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="date-input"
            />
            <span className="date-separator">→</span>
            <span className="date-label">End:</span>
            <span className="date-value">{plan.endDate}</span>
          </div>
          <span className="meta-item">🏋️ {plan.weeks} weeks</span>
          <span className="meta-item">📝 {plan.workouts.length} workouts</span>
          {plan.source && <span className="meta-item">📄 {plan.source}</span>}
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="plan-controls">
        <div className="filters">
          <input
            type="text"
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as WorkoutType | "all")
            }
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="run">🏃 Run</option>
            <option value="bike">🚴 Bike</option>
            <option value="swim">🏊 Swim</option>
            <option value="strength">💪 Strength</option>
            <option value="rest">😴 Rest</option>
          </select>
        </div>

        <div className="actions-group">
          <button
            onClick={() => setShowPaceConfig(true)}
            className="btn-secondary btn-icon"
            title="Configure Paces & Intensities"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Configure Paces
          </button>

          <button onClick={handleAddWorkout} className="btn-add-workout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Add Workout
          </button>
        </div>
      </div>

      {/* Workouts Table */}
      <div className="table-container">
        <table className="workouts-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Name</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Distance</th>
              <th>Intensity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedWorkouts.map((workout) => (
              <WorkoutRow
                key={workout.id}
                workout={workout}
                onUpdate={handleWorkoutUpdate}
                onDelete={handleWorkoutDelete}
              />
            ))}
          </tbody>
        </table>

        {sortedWorkouts.length === 0 && (
          <div className="empty-state">
            <p>
              No workouts found. Try adjusting your filters or add a new
              workout.
            </p>
          </div>
        )}
      </div>

      {showPaceConfig && (
        <PaceConfiguration
          plan={plan}
          paceMapping={paceMapping}
          onPaceMappingChange={handlePaceMappingChange}
          onClose={() => setShowPaceConfig(false)}
        />
      )}

      <style>{`
        .plan-preview {
          width: 100%;
        }

        .plan-header {
          background: var(--color-bg-elevated);
          padding: var(--space-xl);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-lg);
        }

        .plan-name-input {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--color-text-primary);
          width: 100%;
          padding: var(--space-sm) 0;
          margin-bottom: var(--space-md);
          transition: border-color var(--transition-base);
        }

        .plan-name-input:focus {
          outline: none;
          border-bottom-color: var(--color-accent);
        }

        .plan-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-lg);
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }

        .meta-date-range {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .date-label {
          font-weight: var(--weight-semibold);
        }

        .date-input {
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: var(--space-xs) var(--space-sm);
          color: var(--color-text-primary);
          font-family: var(--font-body);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .date-input:hover {
          border-color: var(--color-accent);
          background: var(--color-bg-elevated);
        }

        .date-input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 2px rgba(255, 107, 0, 0.1);
        }

        .date-separator {
          color: var(--color-text-tertiary);
          margin: 0 var(--space-xs);
        }

        .date-value {
          font-weight: var(--weight-medium);
          color: var(--color-text-primary);
        }

        .plan-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
          flex-wrap: wrap;
        }

        .filters {
          display: flex;
          gap: var(--space-md);
          flex: 1;
        }

        .search-input,
        .filter-select {
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--space-sm) var(--space-md);
          color: var(--color-text-primary);
          font-family: var(--font-body);
          font-size: var(--text-sm);
          transition: all var(--transition-fast);
        }

        .search-input {
          flex: 1;
          max-width: 300px;
        }

        .search-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: var(--color-accent);
          background: var(--color-bg-surface);
        }

        .btn-add-workout {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          background: var(--color-accent);
          color: var(--color-text-inverse);
          border: none;
          border-radius: var(--radius-md);
          padding: var(--space-sm) var(--space-lg);
          font-family: var(--font-body);
          font-weight: var(--weight-semibold);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .btn-add-workout:hover {
          background: var(--color-accent-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow);
        }

        .table-container {
          background: var(--color-bg-elevated);
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--color-border);
        }

        .workouts-table {
          width: 100%;
          border-collapse: collapse;
        }

        .workouts-table thead {
          background: var(--color-bg-surface);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .workouts-table th {
          padding: var(--space-md);
          text-align: left;
          font-family: var(--font-body);
          font-weight: var(--weight-semibold);
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
          color: var(--color-text-secondary);
          border-bottom: 2px solid var(--color-border);
        }

        .workouts-table tbody tr {
          border-bottom: 1px solid var(--color-border);
        }

        .workouts-table tbody tr:last-child {
          border-bottom: none;
        }

        .empty-state {
          padding: var(--space-3xl);
          text-align: center;
          color: var(--color-text-tertiary);
        }

        @media (max-width: 768px) {
          .plan-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filters {
            flex-direction: column;
          }

          .search-input {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
