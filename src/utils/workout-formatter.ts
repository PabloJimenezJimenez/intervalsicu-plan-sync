// Utility to format workouts for intervals.icu structured workout format
// This formats workouts in intervals.icu's text-based syntax that gets parsed
// into structured workouts that sync to Garmin watches

import type { Workout, Interval, WorkoutType } from '../types/workout';

/**
 * Format a workout into intervals.icu structured text format
 * This text will be parsed by intervals.icu and synced to Garmin as a structured workout
 */
export function formatWorkoutForIntervalsICU(
  workout: Workout, 
  paceMapping: Record<string, string> = {}
): string {
  // If no intervals defined, try to create a single step from the main workout details
  // This ensures even simple "8km run" workouts are structured
  let intervalsToFormat = workout.intervals || [];
  
  if (intervalsToFormat.length === 0) {
    // Create a synthetic interval from the main workout data
    if (workout.distance || workout.duration) {
      intervalsToFormat = [{
        repeat: 1,
        duration: (workout.distance ? workout.distance * 1000 : (workout.duration || 0) * 60),
        durationType: workout.distance ? 'distance' : 'time',
        intensity: workout.intensity || 'Easy'
      }];
    } else {
      // If absolutely no data, return description as fallback
      return workout.description;
    }
  }

  const sections: string[] = [];

  // Try to detect workout phases from description
  const phases = detectWorkoutPhases(workout.description, paceMapping);

  // Add warmup if detected
  if (phases.warmup) {
    sections.push('Warmup');
    sections.push(phases.warmup);
    sections.push('');
  }

  // Add main set
  if (intervalsToFormat.length > 0) {
    // Only add "Main Set" header if we have other phases or multiple intervals
    // For a single simple step, we can just list it (cleaner for simple runs)
    if (phases.warmup || phases.cooldown || intervalsToFormat.length > 1) {
      sections.push('Main Set');
    }
    
    const intervalText = formatIntervals(intervalsToFormat, workout.type, paceMapping);
    sections.push(intervalText);
    sections.push('');
  } else if (phases.mainSet) {
     // Fallback to detected main set text if no structured intervals but text detected
     sections.push('Main Set');
     sections.push(phases.mainSet);
     sections.push('');
  }

  // Add cooldown if detected
  if (phases.cooldown) {
    sections.push('Cooldown');
    sections.push(phases.cooldown);
    sections.push('');
  }

  // If no structured format was created, return original
  const formatted = sections.join('\n').trim();
  if (!formatted) {
    return workout.description;
  }

  // Append original description as notes if it contains additional info
  // But strictly strictly as text, not to be parsed
  const hasAdditionalInfo = workout.description.length > 20 && !workout.description.includes(formatted);
  if (hasAdditionalInfo) {
    // Use "Notes:" prompt which intervals.icu recognizes usually as non-workout text
    // Or simpler, just append it at the bottom separated by blank lines
    // We clean up the description to avoid duplicate text if it was used to generate intervals
    return formatted; 
  }

  return formatted;
}

/**
 * Format intervals into intervals.icu text format
 */
function formatIntervals(
  intervals: Interval[], 
  workoutType: WorkoutType,
  paceMapping: Record<string, string>
): string {
  const lines: string[] = [];

  for (const interval of intervals) {
    // Add repeat indicator if more than 1
    if (interval.repeat > 1) {
      lines.push(`${interval.repeat}x`);
    }

    // Format main interval
    const intervalLine = formatSingleInterval(interval, workoutType, paceMapping);
    lines.push(`- ${intervalLine}`);

    // Format recovery if present
    if (interval.recovery) {
      const recoveryLine = formatRecovery(interval, workoutType, paceMapping);
      lines.push(`- ${recoveryLine}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format a single interval step
 */
function formatSingleInterval(
  interval: Interval, 
  workoutType: WorkoutType,
  paceMapping: Record<string, string>
): string {
  const isDistanceBased = interval.durationType === 'distance';
  
  // Format duration
  let durationStr: string;
  if (isDistanceBased) {
    // For running/swimming, duration is in meters
    if (interval.duration >= 1000) {
      durationStr = `${(interval.duration / 1000).toFixed(1)}km`;
    } else {
      durationStr = `${interval.duration}m`;
    }
  } else {
    // Time-based: convert seconds to minutes
    if (interval.duration >= 60) {
      const minutes = Math.floor(interval.duration / 60);
      const seconds = interval.duration % 60;
      durationStr = seconds > 0 ? `${minutes}m${seconds}s` : `${minutes}m`;
    } else {
      durationStr = `${interval.duration}s`;
    }
  }

  // Format intensity
  const intensityStr = formatIntensity(interval.intensity, workoutType, paceMapping);

  // Handle ramp intervals
  if (interval.ramp) {
    return `${durationStr} Ramp ${interval.ramp.start}-${interval.ramp.end}`;
  }

  return `${durationStr} ${intensityStr}`;
}

/**
 * Format recovery portion of interval
 */
function formatRecovery(
  interval: Interval, 
  workoutType: WorkoutType,
  paceMapping: Record<string, string>
): string {
  if (!interval.recovery) return '';

  const isDistanceBased = interval.durationType === 'distance';
  
  // Format recovery duration
  let recoveryStr: string;
  if (isDistanceBased) {
    if (interval.recovery >= 1000) {
      recoveryStr = `${(interval.recovery / 1000).toFixed(1)}km`;
    } else {
      recoveryStr = `${interval.recovery}m`;
    }
  } else {
    if (interval.recovery >= 60) {
      const minutes = Math.floor(interval.recovery / 60);
      const seconds = interval.recovery % 60;
      recoveryStr = seconds > 0 ? `${minutes}m${seconds}s` : `${minutes}m`;
    } else {
      recoveryStr = `${interval.recovery}s`;
    }
  }

  // Format recovery intensity
  const recoveryIntensity = interval.recoveryIntensity || 'Easy';
  const intensityStr = formatIntensity(recoveryIntensity, workoutType, paceMapping);

  return `${recoveryStr} ${intensityStr}`;
}

/**
 * Format intensity for intervals.icu
 * Maps common intensity descriptions to intervals.icu format
 */
function formatIntensity(
  intensity: string, 
  workoutType: WorkoutType,
  paceMapping: Record<string, string>
): string {
  // Guard against undefined/null intensity
  if (!intensity) {
    return workoutType === 'run' ? 'Easy pace' : 'moderate';
  }

  // Check user-defined mapping first
  if (paceMapping[intensity]) {
    const mappedValue = paceMapping[intensity];
    // Check if it already contains "Pace" or "HR" or "Power" keyword
    // If not, and looks like a pace range (e.g. 5:00-5:10/km), try to be smart
    // But for now, trust user input or append "Pace" if it looks like pace
    
    // If user enters "6:50-7:10/km", we append "Pace" to make it valid syntax
    if (mappedValue.includes('/km') || mappedValue.includes('/mi') || /^\d+:\d+/.test(mappedValue)) {
      if (!mappedValue.toLowerCase().includes('pace')) {
        return `${mappedValue} Pace`;
      }
    }
    
    return mappedValue;
  }

  // Already in a good format (Z1, Z2, etc.)
  if (/^Z[1-5]$/i.test(intensity)) {
    return intensity.toUpperCase();
  }

  // Percentage format (e.g., "80%", "80-90%")
  if (intensity.includes('%')) {
    return intensity;
  }

  // Map common intensity descriptions
  const intensityMap: Record<string, string> = {
    // General
    'easy': workoutType === 'run' ? 'Easy pace' : 'Z2',
    'recovery': 'Z1',
    'endurance': 'Z2',
    'aerobic': 'Z2',
    'tempo': 'Z3',
    'threshold': 'Z4',
    'lactate threshold': 'Z4',
    'lt': 'Z4',
    'vo2 max': 'Z5',
    'vo2max': 'Z5',
    'intervals': 'Z5',
    
    // Running specific
    '5k pace': '5K pace',
    '10k pace': '10K pace',
    'marathon pace': 'Marathon pace',
    'half marathon pace': 'Half Marathon pace',
    
    // Cycling specific
    'ftp': '100%',
    'sweet spot': '88-93%',
  };

  const normalized = intensity.toLowerCase().trim();
  return intensityMap[normalized] || intensity;
}

/**
 * Detect workout phases from description text
 * Attempts to identify warmup, main set, and cooldown sections
 */
function detectWorkoutPhases(
  description: string,
  paceMapping: Record<string, string> = {}
): {
  warmup?: string;
  mainSet?: string;
  cooldown?: string;
} {
  const phases: { warmup?: string; mainSet?: string; cooldown?: string } = {};

  const lines = description.split('\n').map(l => l.trim()).filter(l => l);

  // Look for warmup keywords
  const warmupPattern = /^(warmup|warm-up|warm up):?\s*(.+)/i;
  const cooldownPattern = /^(cooldown|cool-down|cool down):?\s*(.+)/i;

  for (const line of lines) {
    const warmupMatch = line.match(warmupPattern);
    if (warmupMatch) {
      phases.warmup = formatPhaseText(warmupMatch[2], paceMapping);
      continue;
    }

    const cooldownMatch = line.match(cooldownPattern);
    if (cooldownMatch) {
      phases.cooldown = formatPhaseText(cooldownMatch[2], paceMapping);
      continue;
    }
  }

  return phases;
}

/**
 * Format phase text (warmup/cooldown) into intervals.icu format
 */
function formatPhaseText(text: string, paceMapping: Record<string, string>): string {
  // Extract duration and intensity
  // e.g., "10 minutes easy" -> "10m Easy"
  const timeMatch = text.match(/(\d+)\s*(min|minute|minutes|m)/i);
  const distanceMatch = text.match(/(\d+)\s*(km|k|miles?|m)\b/i);

  if (timeMatch) {
    const duration = timeMatch[1];
    const intensity = text.replace(timeMatch[0], '').trim() || 'Easy';
    return `- ${duration}m ${formatIntensity(intensity, 'run', paceMapping)}`;
  }

  if (distanceMatch) {
    const distance = distanceMatch[1];
    const unit = distanceMatch[2].toLowerCase();
    const distanceStr = unit.includes('k') ? `${distance}km` : `${distance}m`;
    const intensity = text.replace(distanceMatch[0], '').trim() || 'Easy';
    return `- ${distanceStr} ${formatIntensity(intensity, 'run', paceMapping)}`;
  }

  // Fallback: return as-is with a dash
  return `- ${text}`;
}

/**
 * Parse a workout description to extract structured intervals
 * This is a helper function for AI extraction
 */
export function parseIntervalDescription(description: string): Interval[] {
  const intervals: Interval[] = [];

  // Pattern: "5x1000m at 5K pace with 400m recovery"
  const intervalPattern = /(\d+)\s*x\s*(\d+)(m|km|min|minutes?)\s+(?:at\s+)?([^w]+?)(?:\s+with\s+(\d+)(m|km|min|minutes?)\s+(.+?))?(?:\n|$)/gi;

  let match;
  while ((match = intervalPattern.exec(description)) !== null) {
    const repeat = parseInt(match[1]);
    const duration = parseInt(match[2]);
    const durationUnit = match[3].toLowerCase();
    const intensity = match[4].trim();
    const recovery = match[5] ? parseInt(match[5]) : undefined;
    const recoveryUnit = match[6]?.toLowerCase();
    const recoveryIntensity = match[7]?.trim();

    // Determine if time or distance based
    const isTimeBased = durationUnit.includes('min');
    // isDurationMeters was unused
    const durationType = isTimeBased ? 'time' : 'distance';

    // Convert to seconds/meters
    let finalDuration = duration;
    if (isTimeBased && durationUnit.includes('min')) {
      finalDuration = duration * 60; // Convert to seconds
    } else if (durationUnit === 'km') {
      finalDuration = duration * 1000; // Convert to meters
    }

    let finalRecovery = recovery;
    if (recovery && recoveryUnit) {
      if (recoveryUnit.includes('min')) {
        finalRecovery = recovery * 60;
      } else if (recoveryUnit === 'km') {
        finalRecovery = recovery * 1000;
      }
    }

    intervals.push({
      repeat,
      duration: finalDuration,
      durationType,
      intensity,
      recovery: finalRecovery,
      recoveryIntensity,
    });
  }

  return intervals;
}
