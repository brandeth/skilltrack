import type { StreakStatus } from "./tracker-types";
import { parseDateKey, toDateKey, addDays, diffInDays } from "./tracker-date";

export function calculateLongestStreak(dateKeys: string[]) {
  if (!dateKeys.length) {
    return 0;
  }

  const ordered = [...new Set(dateKeys)].sort();
  let longest = 1;
  let current = 1;

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1]!;
    const currentKey = ordered[index]!;

    if (diffInDays(currentKey, previous) === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export function calculateCurrentStreak(
  dateKeys: string[],
  todayKey: string,
): { count: number; status: StreakStatus } {
  if (!dateKeys.length) {
    return { count: 0, status: "broken" };
  }

  const ordered = [...new Set(dateKeys)].sort((left, right) =>
    right.localeCompare(left),
  );
  const set = new Set(ordered);
  const yesterdayKey = toDateKey(addDays(parseDateKey(todayKey), -1));

  let anchor = "";
  let status: StreakStatus = "broken";

  if (set.has(todayKey)) {
    anchor = todayKey;
    status = "active";
  } else if (set.has(yesterdayKey)) {
    anchor = yesterdayKey;
    status = "at-risk";
  } else {
    return { count: 0, status: "broken" };
  }

  let streakCount = 0;
  let pointer = anchor;

  while (set.has(pointer)) {
    streakCount += 1;
    pointer = toDateKey(addDays(parseDateKey(pointer), -1));
  }

  return { count: streakCount, status };
}
