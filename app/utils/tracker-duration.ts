type DurationResult =
  | { valid: false; minutes?: undefined; error: string }
  | { valid: true; minutes: number; error?: undefined };

export function parseDurationInput(rawValue: string): DurationResult {
  const input = rawValue.trim().toLowerCase();

  if (!input) {
    return { valid: false, error: "Enter a duration in minutes or hours." };
  }

  if (/^\d+(\.\d+)?$/.test(input)) {
    const numericValue = Number(input);
    const minutes = input.includes(".")
      ? Math.round(numericValue * 60)
      : Math.round(numericValue);

    if (minutes < 1) {
      return { valid: false, error: "Duration must be at least 1 minute." };
    }

    return { valid: true, minutes };
  }

  const hourMatch = input.match(/(\d+(?:\.\d+)?)\s*h/);
  const minuteMatch = input.match(/(\d+(?:\.\d+)?)\s*m/);

  if (!hourMatch && !minuteMatch) {
    return { valid: false, error: "Use formats like 45, 1.5, or 1h 30m." };
  }

  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
  const totalMinutes = Math.round(hours * 60 + minutes);

  if (totalMinutes < 1) {
    return { valid: false, error: "Duration must be at least 1 minute." };
  }

  return { valid: true, minutes: totalMinutes };
}
