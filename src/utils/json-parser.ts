// JSON Plan parser and validator

import type { APIResult } from '../types/api';
import type { TrainingPlan, Workout, WorkoutType, IntensityLevel } from '../types/workout';
import { generatePlanId, generateWorkoutId, calculateWeeks } from './workout-validator';

/**
 * Validate a file is a JSON file
 */
export function validateJSONFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.name.endsWith('.json') && file.type !== 'application/json') {
    return { valid: false, error: 'File must be a JSON file' };
  }

  // Check file size (max 5MB for JSON)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'JSON file must be less than 5MB' };
  }

  return { valid: true };
}

/**
 * Validate workout object structure
 */
function validateWorkout(workout: unknown, index: number): { valid: boolean; error?: string; workout?: Partial<Workout> } {
  if (typeof workout !== 'object' || workout === null) {
    return { valid: false, error: `Workout at index ${index} is not an object` };
  }

  const w = workout as Record<string, unknown>;

  // Required fields
  if (!w.date || typeof w.date !== 'string') {
    return { valid: false, error: `Workout at index ${index} is missing a valid 'date' field (expected YYYY-MM-DD format)` };
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(w.date)) {
    return { valid: false, error: `Workout at index ${index} has invalid date format: ${w.date}. Expected YYYY-MM-DD` };
  }

  if (!w.type || typeof w.type !== 'string') {
    return { valid: false, error: `Workout at index ${index} is missing a valid 'type' field` };
  }

  const validTypes: WorkoutType[] = ['run', 'bike', 'swim', 'strength', 'rest'];
  if (!validTypes.includes(w.type as WorkoutType)) {
    return { valid: false, error: `Workout at index ${index} has invalid type: ${w.type}. Expected one of: ${validTypes.join(', ')}` };
  }

  if (!w.name || typeof w.name !== 'string') {
    return { valid: false, error: `Workout at index ${index} is missing a valid 'name' field` };
  }

  // Optional fields validation
  if (w.intensity && typeof w.intensity === 'string') {
    const validIntensities: IntensityLevel[] = ['easy', 'moderate', 'hard', 'race'];
    if (!validIntensities.includes(w.intensity as IntensityLevel)) {
      return { valid: false, error: `Workout at index ${index} has invalid intensity: ${w.intensity}. Expected one of: ${validIntensities.join(', ')}` };
    }
  }

  return {
    valid: true,
    workout: {
      date: w.date as string,
      type: w.type as WorkoutType,
      name: w.name as string,
      description: (w.description as string) || '',
      duration: w.duration as number | undefined,
      distance: w.distance as number | undefined,
      intensity: w.intensity as IntensityLevel | undefined,
      intervals: w.intervals as Workout['intervals'],
      notes: w.notes as string | undefined,
    }
  };
}

/**
 * Parse and validate JSON training plan structure
 */
export function validateTrainingPlanJSON(data: unknown): { valid: boolean; error?: string; plan?: TrainingPlan } {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: 'Invalid JSON: expected an object' };
  }

  const obj = data as Record<string, unknown>;

  // Required fields
  if (!obj.name || typeof obj.name !== 'string') {
    return { valid: false, error: "Missing required field: 'name' (string)" };
  }

  if (!obj.startDate || typeof obj.startDate !== 'string') {
    return { valid: false, error: "Missing required field: 'startDate' (YYYY-MM-DD format)" };
  }

  if (!obj.endDate || typeof obj.endDate !== 'string') {
    return { valid: false, error: "Missing required field: 'endDate' (YYYY-MM-DD format)" };
  }

  // Validate date formats
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(obj.startDate)) {
    return { valid: false, error: `Invalid startDate format: ${obj.startDate}. Expected YYYY-MM-DD` };
  }
  if (!dateRegex.test(obj.endDate)) {
    return { valid: false, error: `Invalid endDate format: ${obj.endDate}. Expected YYYY-MM-DD` };
  }

  if (!Array.isArray(obj.workouts)) {
    return { valid: false, error: "Missing required field: 'workouts' (array)" };
  }

  if (obj.workouts.length === 0) {
    return { valid: false, error: 'Workouts array is empty' };
  }

  // Validate each workout
  const validatedWorkouts: Workout[] = [];
  for (let i = 0; i < obj.workouts.length; i++) {
    const result = validateWorkout(obj.workouts[i], i);
    if (!result.valid) {
      return { valid: false, error: result.error };
    }
    validatedWorkouts.push({
      ...result.workout!,
      id: generateWorkoutId(),
    } as Workout);
  }

  const plan: TrainingPlan = {
    id: generatePlanId(),
    name: obj.name,
    startDate: obj.startDate,
    endDate: obj.endDate,
    weeks: calculateWeeks(obj.startDate, obj.endDate),
    workouts: validatedWorkouts,
    source: 'json-import',
  };

  return { valid: true, plan };
}

/**
 * Read and parse a JSON file
 */
export async function readJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse JSON file. Please ensure it is valid JSON.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Process JSON file and extract training plan
 */
export async function processJSONFile(file: File): Promise<APIResult<TrainingPlan>> {
  try {
    // Validate file
    const validation = validateJSONFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error ?? 'Unknown validation error' };
    }

    // Read and parse JSON
    const data = await readJSONFile(file);

    // Validate and transform to TrainingPlan
    const result = validateTrainingPlanJSON(data);
    if (!result.valid) {
      return { success: false, error: result.error ?? 'Unknown validation error' };
    }

    // Update source to include filename
    result.plan!.source = file.name;

    return { success: true, data: result.plan! };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process JSON file',
    };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
