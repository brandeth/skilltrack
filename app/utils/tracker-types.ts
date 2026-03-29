export type GoalType = "weekly" | "total";
export type StreakStatus = "active" | "at-risk" | "broken";

export interface SkillGoal {
  type: GoalType;
  targetHours: number;
}

export interface Skill {
  id: string;
  name: string;
  color: string;
  goal: SkillGoal | null;
  createdAt: string;
}

export interface PracticeSession {
  id: string;
  skillId: string;
  durationMinutes: number;
  date: string;
  notes: string | null;
  createdAt: string;
}

export interface TrackerData {
  skills: Skill[];
  sessions: PracticeSession[];
}

export interface DailyAggregate {
  totalMinutes: number;
  sessionCount: number;
  skillNames: Set<string>;
}

export interface HeatmapDay {
  dateKey: string;
  dateLabel: string;
  totalMinutes: number;
  sessionCount: number;
  skills: string[];
  bucket: 0 | 1 | 2 | 3;
  isToday: boolean;
  summary: string;
}

export interface SkillSummary {
  skill: Skill;
  totalMinutes: number;
  totalHours: number;
  sessionCount: number;
  currentStreak: number;
  longestStreak: number;
  streakStatus: StreakStatus;
  lastPracticedAt: string | null;
  progressValue: number;
  progressMax: number;
  progressCaption: string;
  progressAriaLabel: string;
}

export interface SessionWithSkill extends PracticeSession {
  skillName: string;
  skillColor: string;
}

export interface HeatmapSummary {
  days: Array<HeatmapDay | null>;
  activeDays: number;
  totalMinutes: number;
  busiestDay: HeatmapDay | null;
  summaryText: string;
  accessibleItems: HeatmapDay[];
}
