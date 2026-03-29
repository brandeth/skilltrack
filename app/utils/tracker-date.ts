export function parseDateKey(dateKey: string) {
  const parts = dateKey.split("-").map(Number);
  return new Date(parts[0]!, parts[1]! - 1, parts[2]!);
}

export function toDateKey(input: string | Date) {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  const date = typeof input === "string" ? new Date(input) : input;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfWeek(date: Date) {
  const weekday = (date.getDay() + 6) % 7;
  return addDays(date, -weekday);
}

export function diffInDays(left: string, right: string) {
  const leftDate = parseDateKey(left);
  const rightDate = parseDateKey(right);
  const milliseconds = leftDate.getTime() - rightDate.getTime();
  return Math.round(milliseconds / 86400000);
}
