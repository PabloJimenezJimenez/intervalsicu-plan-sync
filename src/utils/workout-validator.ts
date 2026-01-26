// Workout data validation utilities

import type { Workout, TrainingPlan, WorkoutType, IntensityLevel } from '../types/workout';

/**
 * Validate workout type
 */
export function isValidWorkoutType(type: string): type is WorkoutType {
  const validTypes: WorkoutType[] = ['run', 'bike', 'swim', 'strength', 'rest'];
  return validTypes.includes(type as WorkoutType);
}

/**
 * Validate intensity level
 */
export function isValidIntensity(intensity: string): intensity is IntensityLevel {
  const validIntensities: IntensityLevel[] = ['easy', 'moderate', 'hard', 'race'];
  return validIntensities.includes(intensity as IntensityLevel);
}

/**
 * Validate ISO date format
 */
export function isValidISODate(dateString: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso8601Regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate individual workout
 */
export function validateWorkout(workout: Partial<Workout>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!workout.id) errors.push('Workout ID is required');
  if (!workout.date) {
    errors.push('Workout date is required');
  } else if (!isValidISODate(workout.date)) {
    errors.push('Invalid date format. Use YYYY-MM-DD');
  }
  if (!workout.type) {
    errors.push('Workout type is required');
  } else if (!isValidWorkoutType(workout.type)) {
    errors.push(`Invalid workout type: ${workout.type}`);
  }
  if (!workout.name) errors.push('Workout name is required');
  if (!workout.description) errors.push('Workout description is required');

  // Optional field validation
  if (workout.duration !== undefined && workout.duration < 0) {
    errors.push('Duration must be positive');
  }
  if (workout.distance !== undefined && workout.distance < 0) {
    errors.push('Distance must be positive');
  }
  if (workout.intensity && !isValidIntensity(workout.intensity)) {
    errors.push(`Invalid intensity: ${workout.intensity}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate training plan
 */
export function validateTrainingPlan(plan: Partial<TrainingPlan>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!plan.id) errors.push('Plan ID is required');
  if (!plan.name) errors.push('Plan name is required');
  if (!plan.startDate) {
    errors.push('Start date is required');
  } else if (!isValidISODate(plan.startDate)) {
    errors.push('Invalid start date format');
  }
  if (!plan.endDate) {
    errors.push('End date is required');
  } else if (!isValidISODate(plan.endDate)) {
    errors.push('Invalid end date format');
  }
  if (!plan.workouts || !Array.isArray(plan.workouts)) {
    errors.push('Workouts array is required');
  } else if (plan.workouts.length === 0) {
    errors.push('Plan must have at least one workout');
  }

  // Date range validation
  if (plan.startDate && plan.endDate && isValidISODate(plan.startDate) && isValidISODate(plan.endDate)) {
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    if (end <= start) {
      errors.push('End date must be after start date');
    }
  }

  // Validate each workout
  if (plan.workouts && Array.isArray(plan.workouts)) {
    plan.workouts.forEach((workout, index) => {
      const workoutValidation = validateWorkout(workout);
      if (!workoutValidation.valid) {
        errors.push(`Workout ${index + 1}: ${workoutValidation.errors.join(', ')}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate unique workout ID
 */
export function generateWorkoutId(): string {
  return `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique plan ID
 */
export function generatePlanId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate plan duration in weeks
 */
export function calculateWeeks(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
}
