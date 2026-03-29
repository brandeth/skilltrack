import type { GoalType, TrackerData } from "./tracker-types";
import seedSource from "../../agent-guide/data/sample-skills.json";

export const STORAGE_KEY = "skilltrack:m1";

export const colorPalette = Array.from(
  new Set([
    ...seedSource.skills.map((skill) => skill.color),
    "#0F766E",
    "#2563EB",
    "#9333EA",
    "#EA580C",
    "#E11D48",
    "#CA8A04",
  ]),
);

export function cloneSeedData(): TrackerData {
  return {
    skills: seedSource.skills.map((skill) => ({
      ...skill,
      goal: skill.goal
        ? {
            type: skill.goal.type as GoalType,
            targetHours: skill.goal.targetHours,
          }
        : null,
    })),
    sessions: seedSource.sessions.map((session) => ({ ...session })),
  };
}
