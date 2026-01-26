// Google AI Studio client for PDF extraction using Gemini

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { APIResult } from '../types/api';
import type { TrainingPlan, Workout } from '../types/workout';
import { generatePlanId, generateWorkoutId, calculateWeeks } from './workout-validator';



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
   - Intervals (structured steps for complex workouts)

IMPORTANT for Structured Workouts:
For interval workouts (e.g. "5x1000m at 5K pace with 400m recovery"), extract the structure into the 'intervals' array:
- repeat: number of times to repeat
- duration: the value of the work interval
- durationType: 'distance' (for meters/km) or 'time' (for seconds/minutes)
  - ALWAYS convert time to SECONDS
  - ALWAYS convert distance to METERS
- intensity: target pace/heart rate zone/power (e.g. "5K pace", "Z4", "Threshold")
- recovery: duration of recovery (in SECONDS or METERS)
- recoveryIntensity: usually "Easy" or "Z1"

IMPORTANT:
- Extract ALL workouts from the plan, including rest days
- Convert all distances to kilometers for the main workout object
- Use ISO 8601 date format (YYYY-MM-DD)
- For interval workouts, include the full description (e.g., "5x1000m at 5K pace with 400m jog recovery")
- If a workout has multiple components (e.g., warm-up + intervals + cool-down), include everything in the description
- Infer workout intensity from keywords like "easy", "moderate", "tempo", "threshold", "intervals", "race"

Return the data as a valid JSON object with this structure:
{
  "name": "Plan name",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "workouts": [
    {
      "date": "YYYY-MM-DD",
      "type": "run|bike|swim|strength|rest",
      "name": "Workout name",
      "description": "Full description",
      "duration": 60,
      "distance": 10.5,
      "intensity": "easy|moderate|hard|race",
      "intervals": [
        {
          "repeat": 5,
          "duration": 1000,
          "durationType": "distance",
          "intensity": "5K pace",
          "recovery": 200,
          "recoveryIntensity": "Easy"
        }
      ]
    }
  ]
}`;
}

/**
 * Extract training plan from PDF using Google AI
 */
export async function extractPlanFromPDF(
  pdfBase64: string,
  apiKey: string,
  pdfFilename: string
): Promise<APIResult<TrainingPlan>> {
  try {
    // Set API key as environment variable for this request
    const originalKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;

    const model = google('gemini-2.5-flash');

    // Convert base64 to Uint8Array (browser-compatible alternative to Buffer)
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const result = await generateText({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: createExtractionPrompt() },
            {
              type: 'file',
              data: bytes,
              mediaType: 'application/pdf',
            },
          ],
        },
      ],
      temperature: 0.1,
    });

    // Restore original key
    if (originalKey) {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalKey;
    } else {
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    }

    // Parse the JSON response
    const responseText = result.text.trim();
    
    // Extract JSON from markdown code blocks if present
    let jsonText = responseText;
    if (responseText.startsWith('```')) {
      const jsonMatch = responseText.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
    }

    const extractedData = JSON.parse(jsonText);

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
    console.error('Google AI extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during extraction',
    };
  }
}

/**
 * Validate Google AI API key
 */
export async function validateGoogleAIAPIKey(apiKey: string): Promise<boolean> {
  try {
    // Set API key as environment variable
    const originalKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;

    const model = google('gemini-2.5-flash');
    
    await generateText({
      model,
      messages: [{ role: 'user', content: 'Hello' }],
    });

    // Restore original key
    if (originalKey) {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalKey;
    } else {
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    }

    return true;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}
