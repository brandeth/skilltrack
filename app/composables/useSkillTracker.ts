import type {
  TrackerData,
  SkillGoal,
  Skill,
  PracticeSession,
  SessionWithSkill,
  SkillSummary,
  DailyAggregate,
  HeatmapDay,
  HeatmapSummary,
  GoalType,
} from "../utils/tracker-types";
import { colorPalette, cloneSeedData } from "../utils/tracker-constants";
import {
  parseDateKey,
  toDateKey,
  addDays,
  startOfWeek,
  diffInDays,
} from "../utils/tracker-date";
import {
  formatMinutes,
  formatHours,
  formatDateLong,
} from "../utils/tracker-format";
import {
  calculateLongestStreak,
  calculateCurrentStreak,
} from "../utils/tracker-streak";
import { parseDurationInput } from "../utils/tracker-duration";

export function useSkillTracker() {
  const user = useSupabaseUser();
  const isAuthenticated = computed(() => !!user.value);

  const tracker = useState<TrackerData>("skilltrack-data", () => ({
    skills: [],
    sessions: [],
  }));
  const hydrated = useState<boolean>("skilltrack-hydrated", () => false);
  const dataLoaded = useState<boolean>("skilltrack-loaded", () => false);

  const skills = computed(() => tracker.value.skills);
  const sessions = computed(() => tracker.value.sessions);
  const todayKey = computed(() => toDateKey(new Date()));

  // ── Data Loading ──────────────────────────────────────────────
  async function loadAuthenticatedData() {
    try {
      const [serverSkills, serverSessions] = await Promise.all([
        $fetch<Skill[]>("/api/skills"),
        $fetch<PracticeSession[]>("/api/sessions"),
      ]);

      tracker.value = {
        skills: serverSkills,
        sessions: serverSessions,
      };
    } catch (error) {
      console.error("Failed to load data from server:", error);
      tracker.value = { skills: [], sessions: [] };
    }
  }

  function loadGuestData() {
    tracker.value = cloneSeedData();
  }

  async function hydrateData() {
    if (dataLoaded.value) {
      hydrated.value = true;
      return;
    }

    if (isAuthenticated.value) {
      await loadAuthenticatedData();
    } else {
      const isGuest =
        useCookie("skilltrack-guest").value === "true" ||
        useRoute().query.guest === "true";
      if (isGuest) {
        loadGuestData();
      } else {
        tracker.value = { skills: [], sessions: [] };
      }
    }

    dataLoaded.value = true;
    hydrated.value = true;
  }

  // Trigger hydration on mount (client-side only)
  if (import.meta.client) {
    onMounted(async () => {
      await hydrateData();
    });

    // Re-load data when auth state changes (e.g., login/logout)
    watch(isAuthenticated, async (newVal, oldVal) => {
      if (newVal !== oldVal) {
        dataLoaded.value = false;
        hydrated.value = false;
        await hydrateData();
      }
    });
  }

  const sessionsWithSkill = computed<SessionWithSkill[]>(() => {
    const skillLookup = new Map(skills.value.map((skill) => [skill.id, skill]));

    return [...sessions.value]
      .sort((left, right) => {
        const dateComparison = right.date.localeCompare(left.date);

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return right.createdAt.localeCompare(left.createdAt);
      })
      .map((session) => {
        const skill = skillLookup.get(session.skillId);

        return {
          ...session,
          skillName: skill?.name ?? "Archived skill",
          skillColor: skill?.color ?? "var(--color-border)",
        };
      });
  });

  const totalMinutes = computed(() =>
    sessions.value.reduce((sum, session) => sum + session.durationMinutes, 0),
  );
  const totalHours = computed(() => formatHours(totalMinutes.value));
  const totalSessions = computed(() => sessions.value.length);

  const overallStreak = computed(() => {
    const sessionDates = sessions.value.map((session) => session.date);
    return calculateCurrentStreak(sessionDates, todayKey.value);
  });

  const skillSummaries = computed<SkillSummary[]>(() => {
    const currentWeekStart = toDateKey(
      startOfWeek(parseDateKey(todayKey.value)),
    );

    return skills.value
      .map((skill) => {
        const groupedSessions = sessions.value.filter(
          (session) => session.skillId === skill.id,
        );
        const dateKeys = groupedSessions.map((session) => session.date);
        const currentStreak = calculateCurrentStreak(dateKeys, todayKey.value);
        const longestStreak = calculateLongestStreak(dateKeys);
        const minutes = groupedSessions.reduce(
          (sum, session) => sum + session.durationMinutes,
          0,
        );
        const sessionCount = groupedSessions.length;
        const weeklyMinutes = groupedSessions
          .filter((session) => session.date >= currentWeekStart)
          .reduce((sum, session) => sum + session.durationMinutes, 0);

        let progressValue = minutes;
        let progressMax = Math.max(minutes, 60);
        let progressCaption = `${formatHours(minutes)} hrs total`;
        let progressAriaLabel = `${skill.name} total practice ${formatHours(minutes)} hours across ${sessionCount} sessions.`;

        if (skill.goal) {
          progressValue =
            skill.goal.type === "weekly" ? weeklyMinutes : minutes;
          progressMax = Math.max(
            skill.goal.targetHours * 60,
            progressValue || 60,
          );
          progressCaption =
            skill.goal.type === "weekly"
              ? `${formatHours(weeklyMinutes)} / ${skill.goal.targetHours} hrs this week`
              : `${formatHours(minutes)} / ${skill.goal.targetHours} hrs total`;
          progressAriaLabel = `${skill.name} progress ${Math.round((progressValue / progressMax) * 100) || 0}% toward a ${skill.goal.targetHours} hour ${skill.goal.type} goal.`;
        }

        return {
          skill,
          totalMinutes: minutes,
          totalHours: Number(formatHours(minutes)),
          sessionCount,
          currentStreak: currentStreak.count,
          longestStreak,
          streakStatus: currentStreak.status,
          lastPracticedAt:
            groupedSessions.sort((left, right) =>
              right.date.localeCompare(left.date),
            )[0]?.date ?? null,
          progressValue,
          progressMax,
          progressCaption,
          progressAriaLabel,
        };
      })
      .sort((left, right) => {
        const minuteComparison = right.totalMinutes - left.totalMinutes;

        if (minuteComparison !== 0) {
          return minuteComparison;
        }

        return (right.lastPracticedAt ?? "").localeCompare(
          left.lastPracticedAt ?? "",
        );
      });
  });

  const featuredSkill = computed(() => {
    const summaries = skillSummaries.value;

    if (!summaries.length) {
      return null;
    }

    return [...summaries].sort((left, right) => {
      const leftRecentMinutes = sessions.value
        .filter(
          (session) =>
            session.skillId === left.skill.id &&
            diffInDays(todayKey.value, session.date) <= 14,
        )
        .reduce((sum, session) => sum + session.durationMinutes, 0);
      const rightRecentMinutes = sessions.value
        .filter(
          (session) =>
            session.skillId === right.skill.id &&
            diffInDays(todayKey.value, session.date) <= 14,
        )
        .reduce((sum, session) => sum + session.durationMinutes, 0);
      const leftRecency = left.lastPracticedAt
        ? Math.max(0, 21 - diffInDays(todayKey.value, left.lastPracticedAt))
        : 0;
      const rightRecency = right.lastPracticedAt
        ? Math.max(0, 21 - diffInDays(todayKey.value, right.lastPracticedAt))
        : 0;
      const leftScore =
        left.totalMinutes +
        leftRecentMinutes * 2 +
        left.currentStreak * 75 +
        leftRecency * 10;
      const rightScore =
        right.totalMinutes +
        rightRecentMinutes * 2 +
        right.currentStreak * 75 +
        rightRecency * 10;
      return rightScore - leftScore;
    })[0];
  });

  const recentSessions = computed(() => sessionsWithSkill.value.slice(0, 6));

  const heatmap = computed<HeatmapSummary>(() => {
    const skillLookup = new Map(
      skills.value.map((skill) => [skill.id, skill.name]),
    );
    const aggregates = new Map<string, DailyAggregate>();

    for (const session of sessions.value) {
      const aggregate = aggregates.get(session.date) ?? {
        totalMinutes: 0,
        sessionCount: 0,
        skillNames: new Set<string>(),
      };

      aggregate.totalMinutes += session.durationMinutes;
      aggregate.sessionCount += 1;
      aggregate.skillNames.add(
        skillLookup.get(session.skillId) ?? "Unknown skill",
      );
      aggregates.set(session.date, aggregate);
    }

    const startDate = addDays(parseDateKey(todayKey.value), -89);
    const baseDays: HeatmapDay[] = [];

    for (let offset = 0; offset < 90; offset += 1) {
      const currentDate = addDays(startDate, offset);
      const dateKey = toDateKey(currentDate);
      const aggregate = aggregates.get(dateKey);
      const totalMinutesForDay = aggregate?.totalMinutes ?? 0;
      const sessionCount = aggregate?.sessionCount ?? 0;
      const bucket =
        totalMinutesForDay === 0
          ? 0
          : totalMinutesForDay < 30
            ? 1
            : totalMinutesForDay < 60
              ? 2
              : 3;
      const skillNames = [...(aggregate?.skillNames ?? new Set<string>())];
      const summary =
        totalMinutesForDay === 0
          ? `${formatDateLong(dateKey)}: no practice logged.`
          : `${formatDateLong(dateKey)}: ${formatMinutes(totalMinutesForDay)} across ${sessionCount} session${sessionCount === 1 ? "" : "s"} for ${skillNames.join(", ")}.`;

      baseDays.push({
        dateKey,
        dateLabel: formatDateLong(dateKey),
        totalMinutes: totalMinutesForDay,
        sessionCount,
        skills: skillNames,
        bucket,
        isToday: dateKey === todayKey.value,
        summary,
      });
    }

    const offset = (parseDateKey(baseDays[0]!.dateKey).getDay() + 6) % 7;
    const paddedDays: Array<HeatmapDay | null> = [
      ...Array.from({ length: offset }, () => null),
      ...baseDays,
    ];
    const trailing = (7 - (paddedDays.length % 7 || 7)) % 7;

    for (let index = 0; index < trailing; index += 1) {
      paddedDays.push(null);
    }

    const activeDays = baseDays.filter((day) => day.totalMinutes > 0);
    const totalMinutesForRange = activeDays.reduce(
      (sum, day) => sum + day.totalMinutes,
      0,
    );
    const busiestDay =
      [...activeDays].sort(
        (left, right) => right.totalMinutes - left.totalMinutes,
      )[0] ?? null;
    const summaryText = activeDays.length
      ? `Over the last 90 days you practiced on ${activeDays.length} days for ${formatHours(totalMinutesForRange)} hours total. Your busiest day was ${busiestDay?.dateLabel} with ${formatMinutes(busiestDay?.totalMinutes ?? 0)}.`
      : "No practice has been logged in the last 90 days yet. Add a session to start filling the heatmap.";

    return {
      days: paddedDays,
      activeDays: activeDays.length,
      totalMinutes: totalMinutesForRange,
      busiestDay,
      summaryText,
      accessibleItems: activeDays,
    };
  });

  function addSkill(input: {
    name: string;
    color: string;
    goalType?: GoalType | "";
    targetHours?: number | null;
  }) {
    const name = input.name.trim();

    if (!name) {
      return { ok: false as const, error: "Enter a skill name." };
    }

    const existingMatch = skills.value.find(
      (skill) => skill.name.toLowerCase() === name.toLowerCase(),
    );

    if (existingMatch) {
      return { ok: false as const, error: "That skill already exists." };
    }

    let goal: SkillGoal | null = null;

    if (input.goalType) {
      if (!input.targetHours || input.targetHours <= 0) {
        return {
          ok: false as const,
          error: "Enter a positive goal in hours or clear the goal fields.",
        };
      }

      goal = {
        type: input.goalType,
        targetHours: input.targetHours,
      };
    }

    const optimisticSkill: Skill = {
      id: `skill-${Date.now().toString(36)}`,
      name,
      color: input.color || colorPalette[0]!,
      goal,
      createdAt: new Date().toISOString(),
    };

    tracker.value = {
      ...tracker.value,
      skills: [...tracker.value.skills, optimisticSkill],
    };

    if (isAuthenticated.value) {
      $fetch<Skill>("/api/skills", {
        method: "POST",
        body: {
          name,
          color: optimisticSkill.color,
          goalType: input.goalType || null,
          targetHours: input.targetHours ?? null,
        },
      })
        .then((serverSkill) => {
          tracker.value = {
            ...tracker.value,
            skills: tracker.value.skills.map((s) =>
              s.id === optimisticSkill.id ? serverSkill : s,
            ),
          };
        })
        .catch(() => {
          tracker.value = {
            ...tracker.value,
            skills: tracker.value.skills.filter(
              (s) => s.id !== optimisticSkill.id,
            ),
          };
        });
    }

    return { ok: true as const, skill: optimisticSkill };
  }

  function addSession(input: {
    skillId: string;
    durationInput: string;
    date: string;
    notes?: string;
  }) {
    const skill = skills.value.find((entry) => entry.id === input.skillId);

    if (!skill) {
      return {
        ok: false as const,
        error: "Choose a skill before logging a session.",
      };
    }

    const duration = parseDurationInput(input.durationInput);

    if (!duration.valid) {
      return { ok: false as const, error: duration.error };
    }

    const dateKey = input.date || todayKey.value;

    if (dateKey > todayKey.value) {
      return { ok: false as const, error: "Choose today or a past date." };
    }

    const optimisticSession: PracticeSession = {
      id: `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      skillId: input.skillId,
      durationMinutes: duration.minutes,
      date: dateKey,
      notes: input.notes?.trim() ? input.notes.trim() : null,
      createdAt: new Date().toISOString(),
    };

    tracker.value = {
      ...tracker.value,
      sessions: [...tracker.value.sessions, optimisticSession],
    };

    if (isAuthenticated.value) {
      $fetch<PracticeSession>("/api/sessions", {
        method: "POST",
        body: {
          skillId: input.skillId,
          durationMinutes: duration.minutes,
          date: dateKey,
          notes: input.notes?.trim() || null,
        },
      })
        .then((serverSession) => {
          tracker.value = {
            ...tracker.value,
            sessions: tracker.value.sessions.map((s) =>
              s.id === optimisticSession.id ? serverSession : s,
            ),
          };
        })
        .catch(() => {
          tracker.value = {
            ...tracker.value,
            sessions: tracker.value.sessions.filter(
              (s) => s.id !== optimisticSession.id,
            ),
          };
        });
    }

    return {
      ok: true as const,
      session: optimisticSession,
      warning:
        duration.minutes > 480
          ? "That is a long session. It was saved, but double-check the duration if it looks off."
          : "",
    };
  }

  function deleteSkill(skillId: string) {
    const skill = skills.value.find((s) => s.id === skillId);
    if (!skill) return;

    const removedSkill = skill;
    const removedSessions = sessions.value.filter((s) => s.skillId === skillId);

    tracker.value = {
      skills: tracker.value.skills.filter((s) => s.id !== skillId),
      sessions: tracker.value.sessions.filter((s) => s.skillId !== skillId),
    };

    if (isAuthenticated.value) {
      $fetch(`/api/skills/${skillId}`, { method: "DELETE" }).catch(() => {
        tracker.value = {
          skills: [...tracker.value.skills, removedSkill],
          sessions: [...tracker.value.sessions, ...removedSessions],
        };
      });
    }
  }

  function deleteSession(sessionId: string) {
    const session = sessions.value.find((s) => s.id === sessionId);
    if (!session) return;

    const removedSession = session;

    tracker.value = {
      ...tracker.value,
      sessions: tracker.value.sessions.filter((s) => s.id !== sessionId),
    };

    if (isAuthenticated.value) {
      $fetch(`/api/sessions/${sessionId}`, { method: "DELETE" }).catch(() => {
        tracker.value = {
          ...tracker.value,
          sessions: [...tracker.value.sessions, removedSession],
        };
      });
    }
  }

  return {
    hydrated,
    skills,
    sessions,
    todayKey,
    totalHours,
    totalSessions,
    overallStreak,
    skillSummaries,
    featuredSkill,
    recentSessions,
    heatmap,
    availableColors: colorPalette,
    addSkill,
    addSession,
    deleteSkill,
    deleteSession,
  };
}
