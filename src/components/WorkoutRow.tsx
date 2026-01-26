// Workout row component for inline workout editing

import { useState } from "react";
import type { Workout, WorkoutType, IntensityLevel } from "../types/workout";
import "../styles.css";

interface WorkoutRowProps {
  workout: Workout;
  onUpdate: (workout: Workout) => void;
  onDelete: (id: string) => void;
}

const WORKOUT_TYPES: { value: WorkoutType; label: string; emoji: string }[] = [
  { value: "run", label: "Run", emoji: "🏃" },
  { value: "bike", label: "Bike", emoji: "🚴" },
  { value: "swim", label: "Swim", emoji: "🏊" },
  { value: "strength", label: "Strength", emoji: "💪" },
  { value: "rest", label: "Rest", emoji: "😴" },
];

const INTENSITIES: { value: IntensityLevel; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
  { value: "race", label: "Race" },
];

export function WorkoutRow({ workout, onUpdate, onDelete }: WorkoutRowProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleFieldChange = (field: keyof Workout, value: string | number) => {
    onUpdate({ ...workout, [field]: value });
  };

  const handleDelete = () => {
    onDelete(workout.id);
    setShowDeleteConfirm(false);
  };

  return (
    <tr className="workout-row">
      <td>
        <input
          type="date"
          value={workout.date}
          onChange={(e) => handleFieldChange("date", e.target.value)}
          className="input-date"
        />
      </td>

      <td>
        <select
          value={workout.type}
          onChange={(e) => handleFieldChange("type", e.target.value)}
          className="input-select"
        >
          {WORKOUT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.emoji} {type.label}
            </option>
          ))}
        </select>
      </td>

      <td>
        <input
          type="text"
          value={workout.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          placeholder="Workout name"
          className="input-text"
        />
      </td>

      <td>
        <textarea
          value={workout.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          placeholder="Workout description"
          className="input-textarea"
          rows={2}
        />
      </td>

      <td>
        <input
          type="number"
          value={workout.duration || ""}
          onChange={(e) =>
            handleFieldChange("duration", parseFloat(e.target.value) || 0)
          }
          placeholder="min"
          className="input-number"
          min="0"
        />
      </td>

      <td>
        <input
          type="number"
          value={workout.distance || ""}
          onChange={(e) =>
            handleFieldChange("distance", parseFloat(e.target.value) || 0)
          }
          placeholder="km"
          className="input-number"
          min="0"
          step="0.1"
        />
      </td>

      <td>
        <select
          value={workout.intensity || ""}
          onChange={(e) => handleFieldChange("intensity", e.target.value)}
          className="input-select"
        >
          <option value="">--</option>
          {INTENSITIES.map((intensity) => (
            <option key={intensity.value} value={intensity.value}>
              {intensity.label}
            </option>
          ))}
        </select>
      </td>

      <td className="actions-cell">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-icon btn-delete"
            title="Delete workout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <div className="delete-confirm">
            <button
              onClick={handleDelete}
              className="btn-confirm-delete"
              title="Confirm delete"
            >
              ✓
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn-cancel-delete"
              title="Cancel"
            >
              ✕
            </button>
          </div>
        )}
      </td>

      <style>{`
        .workout-row {
          transition: background var(--transition-base);
        }

        .workout-row:hover {
          background: var(--color-bg-hover);
        }

        .workout-row td {
          padding: var(--space-sm);
          vertical-align: top;
        }

        .input-text,
        .input-date,
        .input-number,
        .input-select,
        .input-textarea {
          width: 100%;
          background: var(--color-bg-base);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: var(--space-xs) var(--space-sm);
          color: var(--color-text-primary);
          font-family: var(--font-body);
          font-size: var(--text-sm);
          transition: all var(--transition-fast);
        }

        .input-text:focus,
        .input-date:focus,
        .input-number:focus,
        .input-select:focus,
        .input-textarea:focus {
          outline: none;
          border-color: var(--color-accent);
          background: var(--color-bg-surface);
        }

        .input-date {
          font-family: var(--font-mono);
        }

        .input-number {
          text-align: right;
          font-family: var(--font-mono);
        }

        .input-textarea {
          resize: vertical;
          min-height: 50px;
        }

        .actions-cell {
          text-align: center;
        }

        .btn-icon {
          background: none;
          border: none;
          color: var(--color-text-tertiary);
          cursor: pointer;
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .btn-icon:hover {
          color: var(--color-text-primary);
          background: var(--color-bg-surface);
        }

        .btn-delete:hover {
          color: var(--color-error);
        }

        .delete-confirm {
          display: flex;
          gap: var(--space-xs);
          justify-content: center;
        }

        .btn-confirm-delete,
        .btn-cancel-delete {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-sm);
          border: none;
          cursor: pointer;
          font-weight: bold;
          font-size: var(--text-sm);
          transition: all var(--transition-fast);
        }

        .btn-confirm-delete {
          background: var(--color-error);
          color: white;
        }

        .btn-confirm-delete:hover {
          background: var(--color-error);
          transform: scale(1.1);
        }

        .btn-cancel-delete {
          background: var(--color-bg-surface);
          color: var(--color-text-secondary);
        }

        .btn-cancel-delete:hover {
          background: var(--color-bg-hover);
        }
      `}</style>
    </tr>
  );
}
