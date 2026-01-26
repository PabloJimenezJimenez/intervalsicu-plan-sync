// Type definitions for API configurations and responses

// ============================================
// intervals.icu API Types
// ============================================

export interface IntervalsICUConfig {
  apiKey: string;
  athleteId?: string; // Optional, defaults to "0" (current user)
}

export interface IntervalsICUEvent {
  id?: number;
  external_id?: string; // Your primary key
  category: string; // "WORKOUT", "NOTE", "RACE", etc.
  start_date_local: string; // ISO 8601 format
  name: string;
  description: string;
  type?: string; // "Run", "Ride", "Swim", etc.
  workout_doc?: string; // intervals.icu native workout format
  moving_time?: number; // Seconds
  distance?: number; // Meters
}

export interface IntervalsICUUploadResponse {
  id: number;
  athlete_id: number;
  start_date_local: string;
  name: string;
}

export interface IntervalsICUError {
  error: string;
  message: string;
  status: number;
}

// ============================================
// OpenRouter API Types
// ============================================

export interface OpenRouterConfig {
  apiKey: string;
  model: string; // e.g., "anthropic/claude-3.5-sonnet"
}

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | OpenRouterContentPart[];
}

export interface OpenRouterContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string; // data:image/jpeg;base64,... or http://...
  };
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  response_format?: {
    type: 'json_object' | 'json_schema';
    schema?: object;
  };
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

// ============================================
// API Response Wrappers
// ============================================

export type APIResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================
// PDF Upload Types
// ============================================

export interface PDFFile {
  file: File;
  filename: string;
  size: number;
  base64: string;
}

export interface PDFMetadata {
  filename: string;
  sizeBytes: number;
  pageCount?: number;
}
