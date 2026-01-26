// intervals.icu API client for uploading workouts

import type {
  IntervalsICUConfig,
  IntervalsICUEvent,
  IntervalsICUUploadResponse,
  IntervalsICUError,
  APIResult,
} from '../types/api';
import type { Workout, TrainingPlan } from '../types/workout';
import { formatWorkoutForIntervalsICU } from './workout-formatter';

const INTERVALS_ICU_BASE_URL = 'https://intervals.icu/api/v1';

/**
 * Create basic auth header for intervals.icu
 */
function createAuthHeader(apiKey: string): string {
  // intervals.icu uses "API_KEY" as username and the key as password
  const credentials = btoa(`API_KEY:${apiKey}`);
  return `Basic ${credentials}`;
}

/**
 * Format workout for intervals.icu API
 */
function formatWorkoutForAPI(workout: Workout): IntervalsICUEvent {
  // Map workout type to intervals.icu category
  const categoryMap: Record<string, string> = {
    run: 'Run',
    bike: 'Ride',
    swim: 'Swim',
    strength: 'WeightTraining',
  };

  // Format date to include time component (T00:00:00) as required by API
  const formattedDate = workout.date.includes('T') 
    ? workout.date 
    : `${workout.date}T00:00:00`;

  // Rest days should use NOTE category and not have a type field
  const isRestDay = workout.type === 'rest';

  // Format description for structured workouts
  // If workout has intervals, use structured format for Garmin sync
  let formattedDescription = workout.description;
  if (workout.intervals && workout.intervals.length > 0) {
    formattedDescription = formatWorkoutForIntervalsICU(workout);
  }

  return {
    external_id: workout.id,
    category: isRestDay ? 'NOTE' : 'WORKOUT',
    start_date_local: formattedDate,
    name: workout.name,
    description: formattedDescription,
    type: isRestDay ? undefined : (categoryMap[workout.type] || 'Run'),
    moving_time: workout.duration ? workout.duration * 60 : undefined, // Convert minutes to seconds
    distance: workout.distance ? workout.distance * 1000 : undefined, // Convert km to meters
  };
}

/**
 * Upload a single workout to intervals.icu
 */
async function uploadSingleWorkout(
  workout: Workout,
  config: IntervalsICUConfig
): Promise<APIResult<IntervalsICUUploadResponse>> {
  const athleteId = config.athleteId || '0'; // 0 = current authenticated athlete

  try {
    const event = formatWorkoutForAPI(workout);

    const response = await fetch(`${INTERVALS_ICU_BASE_URL}/athlete/${athleteId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: createAuthHeader(config.apiKey),
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorData: IntervalsICUError = await response.json();
      return {
        success: false,
        error: errorData.message || `Failed to upload workout: ${workout.name}`,
      };
    }

    const data: IntervalsICUUploadResponse = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Upload multiple workouts to intervals.icu with rate limiting
 */
export async function uploadWorkoutPlan(
  plan: TrainingPlan,
  config: IntervalsICUConfig,
  onProgress?: (current: number, total: number) => void
): Promise<APIResult<{ succeeded: number; failed: number; errors: string[] }>> {
  const results = {
    succeeded: 0,
    failed: 0,
    errors: [] as string[],
  };

  const total = plan.workouts.length;

  for (let i = 0; i < plan.workouts.length; i++) {
    const workout = plan.workouts[i];

    // Upload workout
    const result = await uploadSingleWorkout(workout, config);

    if (result.success) {
      results.succeeded++;
    } else {
      results.failed++;
      results.errors.push(`${workout.name} (${workout.date}): ${result.error}`);
    }

    // Report progress
    if (onProgress) {
      onProgress(i + 1, total);
    }

    // Rate limiting: wait 200ms between requests to avoid overwhelming the API
    if (i < plan.workouts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  if (results.failed > 0) {
    return {
      success: false,
      error: `Uploaded ${results.succeeded} workouts, ${results.failed} failed. Errors: ${results.errors.join('; ')}`,
    };
  }

  return {
    success: true,
    data: results,
  };
}

/**
 * Validate intervals.icu API key
 */
export async function validateIntervalsICUAPIKey(apiKey: string): Promise<APIResult<boolean>> {
  try {
    const response = await fetch(`${INTERVALS_ICU_BASE_URL}/athlete/0`, {
      method: 'GET',
      headers: {
        Authorization: createAuthHeader(apiKey),
      },
    });

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        error: 'Invalid API key',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: `API validation failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get athlete information
 */
export async function getAthleteInfo(config: IntervalsICUConfig): Promise<APIResult<any>> {
  const athleteId = config.athleteId || '0';

  try {
    const response = await fetch(`${INTERVALS_ICU_BASE_URL}/athlete/${athleteId}`, {
      method: 'GET',
      headers: {
        Authorization: createAuthHeader(config.apiKey),
      },
    });

    if (!response.ok) {
      const errorData: IntervalsICUError = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to fetch athlete info',
      };
    }

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
