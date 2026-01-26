// OpenRouter API client for AI-powered PDF extraction

import type {
  OpenRouterConfig,
  OpenRouterRequest,
  OpenRouterResponse,
  OpenRouterError,
  APIResult,
} from '../types/api';
import type { TrainingPlan, Workout } from '../types/workout';
import { generatePlanId, generateWorkoutId, calculateWeeks } from './workout-validator';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * JSON Schema for workout extraction
 */
const WORKOUT_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Name of the training plan' },
    startDate: { type: 'string', format: 'date', description: 'Plan start date in YYYY-MM-DD format' },
    endDate: { type: 'string', format: 'date', description: 'Plan end date in YYYY-MM-DD format' },
    workouts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date', description: 'Workout date in YYYY-MM-DD format' },
          type: {
            type: 'string',
            enum: ['run', 'bike', 'swim', 'strength', 'rest'],
            description: 'Type of workout',
          },
          name: { type: 'string', description: 'Short workout name' },
          description: { type: 'string', description: 'Detailed workout description' },
          duration: { type: 'number', description: 'Duration in minutes (optional)' },
          distance: { type: 'number', description: 'Distance in kilometers (optional)' },
          intensity: {
            type: 'string',
            enum: ['easy', 'moderate', 'hard', 'race'],
            description: 'Workout intensity (optional)',
          },
        },
        required: ['date', 'type', 'name', 'description'],
      },
    },
  },
  required: ['name', 'startDate', 'workouts'],
};

/**
 * Create extraction prompt for AI
 */
function createExtractionPrompt(): string {
  return `You are a training plan extraction expert. Your task is to analyze the provided PDF training plan and extract all workouts in a structured format.

Extract the following information:
1. Plan name (e.g., "12-Week Marathon Training Plan")
2. Start date and end date (infer from the first and last workout dates if not explicitly stated)
3. All workouts with:
   - Date (YYYY-MM-DD format)
   - Type (run, bike, swim, strength, or rest)
   - Name (e.g., "Easy Run", "Tempo Run", "Long Run")
   - Description (full workout details, including pace, intervals, distance)
   - Duration in minutes (if specified)
   - Distance in kilometers (if specified, convert miles to km if needed: 1 mile = 1.60934 km)
   - Intensity (easy, moderate, hard, or race - infer from workout description)

IMPORTANT:
- Extract ALL workouts from the plan, including rest days
- Convert all distances to kilometers
- Use ISO 8601 date format (YYYY-MM-DD)
- For interval workouts, include the full description (e.g., "5x1000m at 5K pace with 400m jog recovery")
- If a workout has multiple components (e.g., warm-up + intervals + cool-down), include everything in the description
- Infer workout intensity from keywords like "easy", "moderate", "tempo", "threshold", "intervals", "race"

Return the data in the exact JSON schema format provided.`;
}

/**
 * Extract training plan from PDF using OpenRouter AI
 */
export async function extractPlanFromPDF(
  pdfBase64: string,
  config: OpenRouterConfig,
  pdfFilename: string
): Promise<APIResult<TrainingPlan>> {
  try {
    const request: OpenRouterRequest = {
      model: config.model,
      messages: [
        {
          role: 'system',
          content: createExtractionPrompt(),
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please extract the training plan from this PDF.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${pdfBase64}`,
              },
            },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        schema: WORKOUT_EXTRACTION_SCHEMA,
      },
      temperature: 0.1, // Low temperature for more consistent extraction
      max_tokens: 4000,
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'Training Plan Importer',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData: OpenRouterError = await response.json();
      return {
        success: false,
        error: errorData.error?.message || 'Failed to extract plan from PDF',
      };
    }

    const data: OpenRouterResponse = await response.json();
    const extractedData = JSON.parse(data.choices[0].message.content);

    // Transform to TrainingPlan with IDs
    const trainingPlan: TrainingPlan = {
      id: generatePlanId(),
      name: extractedData.name,
      startDate: extractedData.startDate,
      endDate: extractedData.endDate || extractedData.startDate,
      weeks: calculateWeeks(extractedData.startDate, extractedData.endDate || extractedData.startDate),
      workouts: extractedData.workouts.map((workout: Partial<Workout>) => ({
        ...workout,
        id: generateWorkoutId(),
      })) as Workout[],
      source: pdfFilename,
    };

    return {
      success: true,
      data: trainingPlan,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Validate OpenRouter API key
 */
export async function validateOpenRouterAPIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      }),
    });

    // A 401 means invalid key, anything else means the key is valid
    return response.status !== 401;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}
