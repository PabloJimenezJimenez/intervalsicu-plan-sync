// DatePicker component with custom styling

import { ChangeEvent } from "react";
import "../styles.css";
import "../animations.css";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  minDate?: string;
}

export function DatePicker({
  value,
  onChange,
  label = "Plan Start Date",
  minDate,
}: DatePickerProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="date-picker">
      <label className="date-picker-label">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M16 2v4M8 2v4M3 10h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={handleChange}
        min={minDate}
        className="date-input"
      />

      <style>{`
        .date-picker {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          margin-bottom: var(--space-xl);
        }

        .date-picker-label {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          color: var(--color-text-secondary);
        }

        .date-picker-label svg {
          color: var(--color-accent);
        }

        .date-input {
          width: 100%;
          padding: var(--space-md) var(--space-lg);
          background: var(--color-bg-elevated);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-family: var(--font-body);
          font-size: var(--text-base);
          transition: all var(--transition-base);
          cursor: pointer;
        }

        .date-input:hover {
          border-color: var(--color-accent);
        }

        .date-input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: var(--shadow-glow);
        }

        /* Custom styling for date picker */
        .date-input::-webkit-calendar-picker-indicator {
          filter: invert(0.8);
          cursor: pointer;
          transition: transform var(--transition-base);
        }

        .date-input::-webkit-calendar-picker-indicator:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
