// Calendar view component for displaying workouts in a visual calendar format

import { useState, useMemo } from "react";
import type { Workout, WorkoutType, IntensityLevel } from "../types/workout";
import "../styles.css";

interface CalendarViewProps {
  workouts: Workout[];
  startDate: string;
  endDate: string;
  onWorkoutClick: (workout: Workout) => void;
  onAddWorkout: (date: string) => void;
  onWorkoutUpdate: (workout: Workout) => void;
  onWorkoutDelete: (id: string) => void;
}

const WORKOUT_TYPE_CONFIG: Record<
  WorkoutType,
  { color: string; label: string }
> = {
  run: { color: "hsl(32, 100%, 55%)", label: "Run" },
  bike: { color: "hsl(142, 76%, 45%)", label: "Bike" },
  swim: { color: "hsl(200, 80%, 50%)", label: "Swim" },
  strength: { color: "hsl(280, 60%, 55%)", label: "Strength" },
  rest: { color: "hsl(210, 20%, 50%)", label: "Rest" },
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeekData {
  weekNumber: number;
  weekStart: Date;
  days: {
    date: Date;
    dateStr: string;
    workouts: Workout[];
    isInRange: boolean;
  }[];
}

function getWeekNumber(date: Date, planStartDate: Date): number {
  const diffTime = date.getTime() - planStartDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function CalendarView({
  workouts,
  startDate,
  endDate,
  onWorkoutClick,
  onAddWorkout,
  onWorkoutUpdate,
  onWorkoutDelete,
}: CalendarViewProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const weeks = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const planStartMonday = getMonday(start);

    // Create workout lookup by date
    const workoutsByDate: Record<string, Workout[]> = {};
    workouts.forEach((w) => {
      if (!workoutsByDate[w.date]) {
        workoutsByDate[w.date] = [];
      }
      workoutsByDate[w.date].push(w);
    });

    const weeksData: WeekData[] = [];
    let currentWeekStart = new Date(planStartMonday);

    while (currentWeekStart <= end) {
      const weekDays: WeekData["days"] = [];

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentWeekStart);
        dayDate.setDate(dayDate.getDate() + i);
        const dateStr = dayDate.toISOString().split("T")[0];

        weekDays.push({
          date: dayDate,
          dateStr,
          workouts: workoutsByDate[dateStr] || [],
          isInRange: dayDate >= start && dayDate <= end,
        });
      }

      weeksData.push({
        weekNumber: getWeekNumber(currentWeekStart, planStartMonday),
        weekStart: new Date(currentWeekStart),
        days: weekDays,
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeksData;
  }, [workouts, startDate, endDate]);

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkout(workout);
    onWorkoutClick(workout);
  };

  const formatDate = (date: Date) => {
    return date.getDate().toString();
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short" });
  };

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split("T")[0];
  };

  return (
    <div className="calendar-view">
      {/* Calendar Header */}
      <div className="calendar-header">
        {DAY_NAMES.map((day) => (
          <div key={day} className="calendar-header-day">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Weeks */}
      <div className="calendar-weeks">
        {weeks.map((week) => (
          <div key={week.weekNumber} className="calendar-week">
            <div className="week-label">W{week.weekNumber}</div>
            <div className="week-days">
              {week.days.map((day) => (
                <div
                  key={day.dateStr}
                  className={`calendar-day ${!day.isInRange ? "out-of-range" : ""} ${isToday(day.dateStr) ? "today" : ""} ${hoveredDay === day.dateStr ? "hovered" : ""}`}
                  onMouseEnter={() => setHoveredDay(day.dateStr)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() => {
                    if (day.isInRange && day.workouts.length === 0) {
                      onAddWorkout(day.dateStr);
                    }
                  }}
                >
                  <div className="day-header">
                    <span className="day-number">{formatDate(day.date)}</span>
                    {day.date.getDate() === 1 && (
                      <span className="day-month">{formatMonth(day.date)}</span>
                    )}
                  </div>

                  <div className="day-workouts">
                    {day.workouts.map((workout) => (
                      <div
                        key={workout.id}
                        className={`workout-chip ${selectedWorkout?.id === workout.id ? "selected" : ""}`}
                        style={{
                          backgroundColor:
                            WORKOUT_TYPE_CONFIG[workout.type].color,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWorkoutClick(workout);
                        }}
                        title={`${workout.name}\n${workout.description}`}
                      >
                        <span className="workout-name">{workout.name}</span>
                        {workout.duration && (
                          <span className="workout-meta">
                            {workout.duration}m
                          </span>
                        )}
                        {workout.distance && (
                          <span className="workout-meta">
                            {workout.distance}km
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {day.isInRange && day.workouts.length === 0 && (
                    <div className="add-workout-hint">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <div
          className="workout-modal-overlay"
          onClick={() => setSelectedWorkout(null)}
        >
          <div className="workout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <span
                  className="modal-type-indicator"
                  style={{
                    backgroundColor:
                      WORKOUT_TYPE_CONFIG[selectedWorkout.type].color,
                  }}
                />
                <input
                  type="text"
                  value={selectedWorkout.name}
                  onChange={(e) =>
                    onWorkoutUpdate({
                      ...selectedWorkout,
                      name: e.target.value,
                    })
                  }
                  className="modal-title-input"
                />
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedWorkout(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-field">
                <label>Date</label>
                <input
                  type="date"
                  value={selectedWorkout.date}
                  onChange={(e) =>
                    onWorkoutUpdate({
                      ...selectedWorkout,
                      date: e.target.value,
                    })
                  }
                  className="modal-input"
                />
              </div>

              <div className="modal-field">
                <label>Type</label>
                <select
                  value={selectedWorkout.type}
                  onChange={(e) =>
                    onWorkoutUpdate({
                      ...selectedWorkout,
                      type: e.target.value as WorkoutType,
                    })
                  }
                  className="modal-select"
                >
                  {Object.entries(WORKOUT_TYPE_CONFIG).map(
                    ([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="modal-row">
                <div className="modal-field half">
                  <label>Duration (min)</label>
                  <input
                    type="number"
                    value={selectedWorkout.duration || ""}
                    onChange={(e) =>
                      onWorkoutUpdate({
                        ...selectedWorkout,
                        duration: parseFloat(e.target.value) || undefined,
                      })
                    }
                    className="modal-input"
                    min="0"
                  />
                </div>
                <div className="modal-field half">
                  <label>Distance (km)</label>
                  <input
                    type="number"
                    value={selectedWorkout.distance || ""}
                    onChange={(e) =>
                      onWorkoutUpdate({
                        ...selectedWorkout,
                        distance: parseFloat(e.target.value) || undefined,
                      })
                    }
                    className="modal-input"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="modal-field">
                <label>Intensity</label>
                <select
                  value={selectedWorkout.intensity || ""}
                  onChange={(e) =>
                    onWorkoutUpdate({
                      ...selectedWorkout,
                      intensity:
                        (e.target.value as IntensityLevel) || undefined,
                    })
                  }
                  className="modal-select"
                >
                  <option value="">--</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                  <option value="race">Race</option>
                </select>
              </div>

              <div className="modal-field">
                <label>Description</label>
                <textarea
                  value={selectedWorkout.description}
                  onChange={(e) =>
                    onWorkoutUpdate({
                      ...selectedWorkout,
                      description: e.target.value,
                    })
                  }
                  className="modal-textarea"
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  onWorkoutDelete(selectedWorkout.id);
                  setSelectedWorkout(null);
                }}
                className="btn-delete-workout"
              >
                Delete Workout
              </button>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="btn-close-modal"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .calendar-view {
          width: 100%;
        }

        .calendar-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          margin-left: 48px;
          margin-bottom: var(--space-sm);
        }

        .calendar-header-day {
          text-align: center;
          padding: var(--space-sm);
          font-family: var(--font-body);
          font-weight: var(--weight-semibold);
          font-size: var(--text-xs);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
          color: var(--color-text-secondary);
        }

        .calendar-weeks {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .calendar-week {
          display: flex;
          gap: 2px;
        }

        .week-label {
          width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          background: var(--color-bg-elevated);
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }

        .week-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          flex: 1;
        }

        .calendar-day {
          min-height: 100px;
          background: var(--color-bg-elevated);
          border-radius: var(--radius-md);
          padding: var(--space-sm);
          border: 1px solid var(--color-border);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .calendar-day:hover {
          border-color: var(--color-border-hover);
          background: var(--color-bg-surface);
        }

        .calendar-day.hovered .add-workout-hint {
          opacity: 1;
        }

        .calendar-day.out-of-range {
          background: var(--color-bg-base);
          opacity: 0.4;
          cursor: default;
        }

        .calendar-day.today {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 1px var(--color-accent);
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: var(--space-xs);
        }

        .day-number {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          color: var(--color-text-primary);
        }

        .today .day-number {
          color: var(--color-accent);
        }

        .day-month {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          text-transform: uppercase;
        }

        .day-workouts {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          flex: 1;
        }

        .workout-chip {
          border-radius: var(--radius-sm);
          padding: var(--space-xs) var(--space-sm);
          font-size: var(--text-xs);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          overflow: hidden;
        }

        .workout-chip:hover {
          filter: brightness(1.15);
          transform: translateY(-1px);
        }

        .workout-chip.selected {
          box-shadow: 0 0 0 2px var(--color-text-primary);
        }

        .workout-name {
          flex: 1;
          color: var(--color-text-inverse);
          white-space: nowrap;
          font-weight: var(--weight-medium);
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: var(--weight-medium);
        }

        .workout-meta {
          font-family: var(--font-mono);
          font-size: 10px;
          color: rgba(0, 0, 0, 0.6);
          flex-shrink: 0;
        }

        .add-workout-hint {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--color-text-tertiary);
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        /* Modal Styles */
        .workout-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .workout-modal {
          background: var(--color-bg-elevated);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg);
          border-bottom: 1px solid var(--color-border);
        }

        .modal-title-row {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          flex: 1;
        }

        .modal-type-indicator {
          width: 16px;
          height: 16px;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }

        .modal-title-input {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--color-text-primary);
          flex: 1;
          padding: var(--space-xs) 0;
          transition: border-color var(--transition-base);
        }

        .modal-title-input:focus {
          outline: none;
          border-bottom-color: var(--color-accent);
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--color-text-tertiary);
          font-size: var(--text-xl);
          cursor: pointer;
          padding: var(--space-sm);
          line-height: 1;
          transition: color var(--transition-fast);
        }

        .modal-close:hover {
          color: var(--color-text-primary);
        }

        .modal-body {
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .modal-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .modal-field.half {
          flex: 1;
        }

        .modal-row {
          display: flex;
          gap: var(--space-md);
        }

        .modal-field label {
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
          color: var(--color-text-secondary);
        }

        .modal-input,
        .modal-select,
        .modal-textarea {
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--space-sm) var(--space-md);
          color: var(--color-text-primary);
          font-family: var(--font-body);
          font-size: var(--text-sm);
          transition: all var(--transition-fast);
        }

        .modal-input:focus,
        .modal-select:focus,
        .modal-textarea:focus {
          outline: none;
          border-color: var(--color-accent);
          background: var(--color-bg-elevated);
        }

        .modal-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          padding: var(--space-lg);
          border-top: 1px solid var(--color-border);
          gap: var(--space-md);
        }

        .btn-delete-workout {
          background: var(--color-error-bg);
          color: var(--color-error);
          border: 1px solid var(--color-error);
          border-radius: var(--radius-md);
          padding: var(--space-sm) var(--space-lg);
          font-family: var(--font-body);
          font-weight: var(--weight-semibold);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-delete-workout:hover {
          background: var(--color-error);
          color: white;
        }

        .btn-close-modal {
          background: var(--color-accent);
          color: var(--color-text-inverse);
          border: none;
          border-radius: var(--radius-md);
          padding: var(--space-sm) var(--space-xl);
          font-family: var(--font-body);
          font-weight: var(--weight-semibold);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-close-modal:hover {
          background: var(--color-accent-hover);
        }

        @media (max-width: 768px) {
          .calendar-header {
            margin-left: 32px;
          }

          .calendar-header-day {
            font-size: 10px;
          }

          .week-label {
            width: 28px;
            font-size: 10px;
          }

          .calendar-day {
            min-height: 80px;
            padding: var(--space-xs);
          }

          .workout-chip {
            padding: 2px 4px;
          }

          .workout-name {
            display: none;
          }

          .workout-modal {
            margin: var(--space-md);
          }
        }
      `}</style>
    </div>
  );
}
