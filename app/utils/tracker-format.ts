import { parseDateKey } from "./tracker-date";

export function formatMinutes(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

export function formatHours(minutes: number) {
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return `${hours}`;
  }

  return hours.toFixed(1);
}

export function formatDateLong(dateKey: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseDateKey(dateKey));
}
