// Type definitions for workout data and API responses

export interface Interval {
  repeat: number;
  duration: number; // Seconds for time-based, meters for distance-based
  durationType?: 'time' | 'distance'; // Default: 'time'
  intensity: string; // e.g., "Z2", "5K pace", "Threshold", "80%"
  recovery?: number; // Seconds or meters
  recoveryIntensity?: string; // e.g., "Z1", "Easy", "50%"
  ramp?: { start: string; end: string }; // For ramp intervals (e.g., "60-80%")
}

export type WorkoutType = 'run' | 'bike' | 'swim' | 'strength' | 'rest';
export type IntensityLevel = 'easy' | 'moderate' | 'hard' | 'race';

export interface Workout {
  id: string;
  date: string; // ISO 8601 format (YYYY-MM-DD)
  type: WorkoutType;
  name: string; // e.g., "Easy Run", "Tempo", "Long Run"
  description: string; // Full workout details
  duration?: number; // Minutes
  distance?: number; // Kilometers
  intensity?: IntensityLevel;
  intervals?: Interval[];
  notes?: string;
}

export interface TrainingPlan {
  id: string;
  name: string;
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
  weeks: number;
  workouts: Workout[];
  source?: string; // Original PDF filename
}

// Week grouping helper type
export interface WeekGroup {
  weekNumber: number;
  startDate: string;
  endDate: string;
  workouts: Workout[];
}
