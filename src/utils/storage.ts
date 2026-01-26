// LocalStorage helpers for persisting API keys and user preferences

const STORAGE_KEYS = {
  INTERVALS_API_KEY: 'intervals_icu_api_key',
  GOOGLE_AI_API_KEY: 'google_ai_api_key',
  PREFERENCES: 'user_preferences',
} as const;

/**
 * Save API key to localStorage
 */
export function saveAPIKey(service: 'intervals' | 'googleai', key: string): void {
  try {
    const storageKey =
      service === 'intervals'
        ? STORAGE_KEYS.INTERVALS_API_KEY
        : STORAGE_KEYS.GOOGLE_AI_API_KEY;
    localStorage.setItem(storageKey, key);
  } catch (error) {
    console.error('Failed to save API key:', error);
  }
}

/**
 * Get API key from localStorage
 */
export function getAPIKey(service: 'intervals' | 'googleai'): string | null {
  try {
    const storageKey =
      service === 'intervals'
        ? STORAGE_KEYS.INTERVALS_API_KEY
        : STORAGE_KEYS.GOOGLE_AI_API_KEY;
    return localStorage.getItem(storageKey);
  } catch (error) {
    console.error('Failed to get API key:', error);
    return null;
  }
}

/**
 * Clear all API keys from localStorage
 */
export function clearAPIKeys(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.INTERVALS_API_KEY);
    localStorage.removeItem(STORAGE_KEYS.GOOGLE_AI_API_KEY);
  } catch (error) {
    console.error('Failed to clear API keys:', error);
  }
}

/**
 * Check if API keys are configured
 */
export function hasAPIKeys(): { intervals: boolean; googleai: boolean } {
  return {
    intervals: !!getAPIKey('intervals'),
    googleai: !!getAPIKey('googleai'),
  };
}

// ============================================
// User Preferences
// ============================================

export interface UserPreferences {
  defaultWorkoutType?: string;
  defaultIntensity?: string;
  timeFormat?: '12h' | '24h';
  distanceUnit?: 'km' | 'mi';
}

/**
 * Save user preferences to localStorage
 */
export function savePreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

/**
 * Get user preferences from localStorage
 */
export function getPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to get preferences:', error);
    return {};
  }
}

/**
 * Clear all localStorage data
 */
export function clearAllStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}
