<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">Skip to dashboard</a>
    <NuxtRouteAnnouncer />

    <header class="topbar">
      <div class="topbar__inner">
        <div class="brand" aria-label="SkillTrack home">
          <span class="brand__mark" aria-hidden="true">S</span>
          <div class="brand__copy">
            <span class="brand__name">SkillTrack</span>
            <span class="brand__tag"
              >Practice visibility for the long game</span
            >
          </div>
        </div>
        <div class="topbar__badge">Frontend MVP</div>
      </div>
    </header>

    <main id="main-content" class="page">
      <div
        v-if="!hydrated"
        class="loading-shell"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="skeleton skeleton--hero" />
        <div class="bento-grid">
          <div class="skeleton" style="grid-column: span 6" />
          <div class="skeleton" style="grid-column: span 6" />
          <div class="skeleton" style="grid-column: span 6" />
          <div class="skeleton" style="grid-column: span 6" />
        </div>
      </div>

      <div v-else class="dashboard">
        <section class="hero-panel" aria-labelledby="dashboard-title">
          <div class="stack">
            <div class="eyebrow">Milestone 1 dashboard</div>
            <h1 id="dashboard-title" class="hero-panel__title">
              See every hour you’ve invested in getting better.
            </h1>
            <p class="hero-panel__copy">
              A fast local-first tracker for deliberate practice. Log a session,
              protect your streak, and keep momentum visible across every skill
              you’re building.
            </p>
            <div class="hero-panel__actions">
              <button
                class="btn btn--primary"
                type="button"
                @click="focusLogForm"
              >
                Log a session
              </button>
              <button
                class="btn btn--secondary"
                type="button"
                @click="focusAddSkill"
              >
                Add a skill
              </button>
            </div>
          </div>

          <aside class="hero-summary" aria-label="Overall dashboard summary">
            <div :class="['status-pill', streakClass(overallStreak.status)]">
              {{ overallStreakLabel }}
            </div>
            <div class="metric-grid">
              <div class="metric">
                <div class="metric__label">Total hours</div>
                <div class="metric__value">{{ totalHours }}</div>
              </div>
              <div class="metric">
                <div class="metric__label">Total sessions</div>
                <div class="metric__value">{{ totalSessions }}</div>
              </div>
              <div class="metric">
                <div class="metric__label">Tracked skills</div>
                <div class="metric__value">{{ skills.length }}</div>
              </div>
            </div>
            <p class="helper-text">
              {{ summaryCopy }}
            </p>
          </aside>
        </section>

        <section
          v-if="skills.length === 0"
          class="panel empty-state"
          aria-labelledby="empty-title"
        >
          <div class="eyebrow">Fresh start</div>
          <h2 id="empty-title" class="empty-state__title">
            Add your first skill to begin tracking practice.
          </h2>
          <p class="empty-state__copy">
            The dashboard is ready for a single-skill workflow or a full stack
            of learning goals. Create one skill below and the logging flow
            becomes immediately available.
          </p>
          <button class="btn btn--primary" type="button" @click="focusAddSkill">
            Create a skill
          </button>
        </section>

        <section class="bento-grid" aria-label="Dashboard widgets">
          <article class="panel panel--log" aria-labelledby="log-session-title">
            <div class="panel__header">
              <div>
                <div class="panel__eyebrow">Quick action</div>
                <h2 id="log-session-title" class="panel__title">
                  Log a session
                </h2>
              </div>
            </div>

            <form
              ref="logFormRef"
              class="form"
              @submit.prevent="handleLogSession"
            >
              <div
                v-if="sessionStatus.error"
                class="status-message status-message--error"
                role="alert"
              >
                {{ sessionStatus.error }}
              </div>
              <div
                v-else-if="sessionStatus.success"
                class="status-message status-message--success"
                role="status"
              >
                {{ sessionStatus.success }}
              </div>
              <div
                v-if="sessionStatus.warning"
                class="status-message status-message--warning"
                role="status"
              >
                {{ sessionStatus.warning }}
              </div>

              <div class="field">
                <label for="skillId">Skill</label>
                <select
                  id="skillId"
                  v-model="sessionForm.skillId"
                  :disabled="skills.length === 0"
                  required
                  aria-required="true"
                >
                  <option value="" disabled>
                    {{ skills.length ? "Select a skill" : "Add a skill first" }}
                  </option>
                  <option
                    v-for="skill in skills"
                    :key="skill.id"
                    :value="skill.id"
                  >
                    {{ skill.name }}
                  </option>
                </select>
              </div>

              <div class="field-row quick-action-row">
                <div class="field field--duration">
                  <label for="duration">Duration</label>
                  <input
                    id="duration"
                    v-model="sessionForm.durationInput"
                    inputmode="text"
                    autocomplete="off"
                    placeholder="45, 1.5, or 1h 30m"
                    required
                    aria-required="true"
                    aria-describedby="duration-help"
                  />
                  <div class="duration-support">
                    <div id="duration-help" class="helper-text">
                      Flexible parsing supports minutes, decimal hours, or mixed
                      hours and minutes.
                    </div>
                    <div class="quick-presets-group">
                      <span id="duration-presets-label" class="label"
                        >Quick durations</span
                      >
                      <div
                        class="quick-presets"
                        role="group"
                        aria-labelledby="duration-presets-label"
                      >
                        <button
                          v-for="preset in durationPresets"
                          :key="preset.label"
                          class="chip-button"
                          type="button"
                          :aria-pressed="
                            sessionForm.durationInput === preset.value
                          "
                          @click="sessionForm.durationInput = preset.value"
                        >
                          {{ preset.label }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="field field--date">
                  <label for="date">Date</label>
                  <input
                    id="date"
                    v-model="sessionForm.date"
                    type="date"
                    :max="todayKey"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div class="field field--notes">
                <label for="notes">
                  Notes <span class="field-label-note">Optional</span>
                </label>
                <textarea
                  id="notes"
                  v-model="sessionForm.notes"
                  placeholder="What clicked, what felt hard, or what to revisit next time?"
                ></textarea>
              </div>

              <button
                class="btn btn--primary"
                type="submit"
                :disabled="skills.length === 0"
              >
                Save session
              </button>
            </form>
          </article>

          <article class="panel panel--add" aria-labelledby="add-skill-title">
            <div class="panel__header">
              <div>
                <div class="panel__eyebrow">Recovery path</div>
                <h2 id="add-skill-title" class="panel__title">Add a skill</h2>
              </div>
            </div>

            <form
              ref="addSkillRef"
              class="form"
              @submit.prevent="handleAddSkill"
            >
              <div
                v-if="skillStatus.error"
                class="status-message status-message--error"
                role="alert"
              >
                {{ skillStatus.error }}
              </div>
              <div
                v-else-if="skillStatus.success"
                class="status-message status-message--success"
                role="status"
              >
                {{ skillStatus.success }}
              </div>

              <div class="field">
                <label for="skill-name">Skill name</label>
                <input
                  id="skill-name"
                  v-model="skillForm.name"
                  type="text"
                  autocomplete="off"
                  placeholder="TypeScript, Piano, Cooking"
                  required
                  aria-required="true"
                />
              </div>

              <div class="field-row">
                <div class="field">
                  <label for="skill-color">Accent color</label>
                  <select id="skill-color" v-model="skillForm.color">
                    <option
                      v-for="color in availableColors"
                      :key="color"
                      :value="color"
                    >
                      {{ color }}
                    </option>
                  </select>
                </div>

                <div class="field">
                  <label for="goal-type">Goal type</label>
                  <select id="goal-type" v-model="skillForm.goalType">
                    <option value="">No goal yet</option>
                    <option value="weekly">Weekly</option>
                    <option value="total">Total hours</option>
                  </select>
                </div>
              </div>

              <div class="field">
                <label for="goal-hours">Goal hours</label>
                <input
                  id="goal-hours"
                  v-model="skillForm.targetHours"
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="5"
                />
              </div>

              <button class="btn btn--secondary" type="submit">
                Create skill
              </button>
            </form>
          </article>

          <article class="panel panel--heatmap" aria-labelledby="heatmap-title">
            <div class="panel__header">
              <div>
                <div class="panel__eyebrow">Consistency view</div>
                <h2 id="heatmap-title" class="panel__title">90-day heatmap</h2>
              </div>
            </div>

            <div class="heatmap-block">
              <p
                class="helper-text"
                :aria-live="skills.length ? 'polite' : 'off'"
              >
                {{ heatmap.summaryText }}
              </p>

              <div class="heatmap-shell" aria-hidden="true">
                <div class="heatmap-weekdays">
                  <span>M</span>
                  <span>W</span>
                  <span>F</span>
                </div>
                <div class="heatmap-grid">
                  <template
                    v-for="(day, index) in heatmap.days"
                    :key="day?.dateKey ?? `blank-${index}`"
                  >
                    <div
                      v-if="day"
                      class="heatmap-cell"
                      :data-bucket="day.bucket"
                      :data-today="day.isToday ? 'true' : 'false'"
                      :title="day.summary"
                    />
                    <div v-else class="heatmap-cell--blank" />
                  </template>
                </div>
              </div>

              <div class="heatmap-legend">
                <span>{{ heatmap.activeDays }} active days in the last 90</span>
                <div class="legend-scale" aria-hidden="true">
                  <span>Less</span>
                  <span
                    class="legend-scale__cell"
                    style="background: var(--color-heatmap-empty)"
                  ></span>
                  <span
                    class="legend-scale__cell"
                    style="background: var(--color-heatmap-light)"
                  ></span>
                  <span
                    class="legend-scale__cell"
                    style="background: var(--color-heatmap-medium)"
                  ></span>
                  <span
                    class="legend-scale__cell"
                    style="background: var(--color-heatmap-heavy)"
                  ></span>
                  <span>More</span>
                </div>
              </div>

              <ul class="sr-only">
                <li v-for="day in heatmap.accessibleItems" :key="day.dateKey">
                  {{ day.summary }}
                </li>
              </ul>
            </div>
          </article>

          <article
            class="panel panel--featured"
            aria-labelledby="featured-title"
          >
            <div class="panel__header">
              <div>
                <div class="panel__eyebrow">Featured focus</div>
                <h2 id="featured-title" class="panel__title">
                  {{
                    featuredSkill
                      ? featuredSkill.skill.name
                      : "No featured skill yet"
                  }}
                </h2>
              </div>
            </div>

            <div v-if="featuredSkill" class="featured-card">
              <div class="featured-card__hero">
                <ProgressRing
                  :value="featuredSkill.progressValue"
                  :max="featuredSkill.progressMax"
                  :size="120"
                  :stroke="9"
                  :color="featuredSkill.skill.color"
                  :label="featuredSkill.progressAriaLabel"
                  :caption="featuredSkill.progressCaption"
                />
                <div class="stack featured-card__content">
                  <div class="featured-card__title-row">
                    <span
                      class="skill-swatch"
                      :style="{ backgroundColor: featuredSkill.skill.color }"
                      aria-hidden="true"
                    />
                    <p class="featured-card__title">
                      {{ featuredSkill.skill.name }}
                    </p>
                  </div>
                  <p class="featured-card__copy">
                    {{ featuredSkill.sessionCount }} sessions logged,
                    {{ formatHours(featuredSkill.totalMinutes) }} hours total,
                    and a {{ featuredSkill.currentStreak }} day
                    {{
                      featuredSkill.streakStatus === "broken"
                        ? "reset"
                        : "running"
                    }}
                    streak.
                  </p>
                  <div
                    :class="[
                      'status-pill',
                      streakClass(featuredSkill.streakStatus),
                    ]"
                  >
                    {{ skillStreakLabel(featuredSkill) }}
                  </div>
                </div>
              </div>

              <div class="featured-card__stats">
                <div class="stat-box">
                  <span class="label">Longest streak</span>
                  <span class="stat-box__value"
                    >{{ featuredSkill.longestStreak }} days</span
                  >
                </div>
                <div class="stat-box">
                  <span class="label">Recent activity</span>
                  <span class="stat-box__value">{{
                    featuredSkill.lastPracticedAt
                      ? formatDateLong(featuredSkill.lastPracticedAt)
                      : "No sessions yet"
                  }}</span>
                </div>
              </div>
            </div>

            <p v-else class="helper-text">
              Create a skill and log a session to unlock your dashboard
              highlights.
            </p>
          </article>

          <article class="panel panel--skills" aria-labelledby="skills-title">
            <div class="panel__header">
              <div>
                <div class="panel__eyebrow">Skill overview</div>
                <h2 id="skills-title" class="panel__title">
                  Per-skill totals and streaks
                </h2>
              </div>
            </div>

            <ul v-if="skillSummaries.length" class="skills-grid skills-list">
              <li
                v-for="summary in skillSummaries"
                :key="summary.skill.id"
                class="skill-card"
              >
                <div class="skill-card__title-row">
                  <span
                    class="skill-swatch"
                    :style="{ backgroundColor: summary.skill.color }"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 class="skill-card__name">{{ summary.skill.name }}</h3>
                    <div class="skill-card__meta">
                      {{ summary.progressCaption }}
                    </div>
                  </div>
                </div>

                <div
                  :class="['status-pill', streakClass(summary.streakStatus)]"
                >
                  {{ skillStreakLabel(summary) }}
                </div>

                <div
                  class="skill-card__metrics"
                  :aria-label="`${summary.skill.name} totals`"
                >
                  <div class="skill-card__metric">
                    <span class="label">Hours</span>
                    <strong>{{ formatHours(summary.totalMinutes) }}</strong>
                  </div>
                  <div class="skill-card__metric">
                    <span class="label">Sessions</span>
                    <strong>{{ summary.sessionCount }}</strong>
                  </div>
                  <div class="skill-card__metric">
                    <span class="label">Current streak</span>
                    <strong>{{ summary.currentStreak }} days</strong>
                  </div>
                  <div class="skill-card__metric">
                    <span class="label">Longest streak</span>
                    <strong>{{ summary.longestStreak }} days</strong>
                  </div>
                </div>
              </li>
            </ul>

            <p v-else class="helper-text">
              No skills yet. Add one to start seeing per-skill totals.
            </p>
          </article>

          <article class="panel panel--recent" aria-labelledby="recent-title">
            <div class="panel__header">
              <div>
                <div class="panel__eyebrow">Momentum log</div>
                <h2 id="recent-title" class="panel__title">Recent sessions</h2>
              </div>
            </div>

            <ul v-if="recentSessions.length" class="recent-list">
              <li
                v-for="session in recentSessions"
                :key="session.id"
                class="session-item"
              >
                <div class="session-item__title-row">
                  <span
                    class="skill-swatch"
                    :style="{ backgroundColor: session.skillColor }"
                    aria-hidden="true"
                  />
                  <strong>{{ session.skillName }}</strong>
                </div>
                <div class="session-item__meta">
                  {{ formatMinutes(session.durationMinutes) }} on
                  {{ formatDateLong(session.date) }}
                </div>
                <p v-if="session.notes" class="session-item__notes">
                  {{ session.notes }}
                </p>
                <p v-else class="session-item__notes">
                  No notes for this session.
                </p>
              </li>
            </ul>

            <p v-else class="helper-text">
              Log a session to start your recent activity feed.
            </p>
          </article>
        </section>
      </div>
    </main>

    <div class="sr-only" aria-live="polite">{{ liveMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import type { GoalType, SkillSummary } from "./composables/useSkillTracker";

const {
  hydrated,
  skills,
  todayKey,
  totalHours,
  totalSessions,
  overallStreak,
  skillSummaries,
  featuredSkill,
  recentSessions,
  heatmap,
  availableColors,
  addSkill,
  addSession,
  formatMinutes,
  formatHours,
  formatDateLong,
} = useSkillTracker();

useHead({
  title: "Dashboard - SkillTrack",
});

const logFormRef = ref<HTMLFormElement | null>(null);
const addSkillRef = ref<HTMLFormElement | null>(null);
const liveMessage = ref("");

const sessionForm = reactive({
  skillId: "",
  durationInput: "",
  date: todayKey.value,
  notes: "",
});

const skillForm = reactive<{
  name: string;
  color: string;
  goalType: GoalType | "";
  targetHours: string;
}>({
  name: "",
  color: availableColors[0] ?? "#059669",
  goalType: "",
  targetHours: "",
});

const sessionStatus = reactive({
  error: "",
  success: "",
  warning: "",
});

const skillStatus = reactive({
  error: "",
  success: "",
});

const durationPresets = [
  { label: "15m", value: "15" },
  { label: "30m", value: "30" },
  { label: "45m", value: "45" },
  { label: "1h", value: "1h" },
];

const overallStreakLabel = computed(() => {
  if (overallStreak.value.status === "active") {
    return `${overallStreak.value.count} day overall streak`;
  }

  if (overallStreak.value.status === "at-risk") {
    return `${overallStreak.value.count} day streak at risk today`;
  }

  return "No active overall streak yet";
});

const summaryCopy = computed(() => {
  if (!skills.value.length) {
    return "Seed data has been replaced or cleared in this browser. Add a skill below to rebuild the dashboard.";
  }

  if (!featuredSkill.value) {
    return "You have skills ready to track. Log the next session to surface your current focus automatically.";
  }

  return `${featuredSkill.value.skill.name} is currently leading your dashboard based on total effort, recent practice, and streak momentum.`;
});

function syncDefaultSkill() {
  if (!skills.value.length) {
    sessionForm.skillId = "";
    return;
  }

  const currentExists = skills.value.some(
    (skill) => skill.id === sessionForm.skillId,
  );

  if (currentExists) {
    return;
  }

  sessionForm.skillId =
    recentSessions.value[0]?.skillId ?? skills.value[0]?.id ?? "";
}

watch(
  [hydrated, skills, recentSessions],
  () => {
    sessionForm.date = todayKey.value;
    syncDefaultSkill();
  },
  { immediate: true },
);

function streakClass(
  status: SkillSummary["streakStatus"] | typeof overallStreak.value.status,
) {
  if (status === "active") {
    return "status-pill--active";
  }

  if (status === "at-risk") {
    return "status-pill--at-risk";
  }

  return "status-pill--broken";
}

function skillStreakLabel(summary: SkillSummary) {
  if (summary.streakStatus === "active") {
    return `${summary.currentStreak} day streak active`;
  }

  if (summary.streakStatus === "at-risk") {
    return `${summary.currentStreak} day streak at risk`;
  }

  return summary.sessionCount
    ? "Streak reset, ready to restart"
    : "No streak yet";
}

function focusLogForm() {
  logFormRef.value
    ?.querySelector<HTMLElement>("select, input, textarea, button")
    ?.focus();
}

function focusAddSkill() {
  addSkillRef.value
    ?.querySelector<HTMLElement>("input, select, textarea, button")
    ?.focus();
}

function handleLogSession() {
  sessionStatus.error = "";
  sessionStatus.success = "";
  sessionStatus.warning = "";

  const result = addSession({
    skillId: sessionForm.skillId,
    durationInput: sessionForm.durationInput,
    date: sessionForm.date,
    notes: sessionForm.notes,
  });

  if (!result.ok) {
    sessionStatus.error = result.error;
    liveMessage.value = result.error;
    return;
  }

  const savedSkill = skills.value.find(
    (skill) => skill.id === result.session.skillId,
  );
  sessionStatus.success = `Saved ${formatMinutes(result.session.durationMinutes)} for ${savedSkill?.name ?? "your skill"}.`;
  sessionStatus.warning = result.warning;
  liveMessage.value = `Session saved: ${formatMinutes(result.session.durationMinutes)} of ${savedSkill?.name ?? "practice"} on ${formatDateLong(result.session.date)}.`;
  sessionForm.durationInput = "";
  sessionForm.notes = "";
  sessionForm.date = todayKey.value;
  sessionForm.skillId = result.session.skillId;
}

function handleAddSkill() {
  skillStatus.error = "";
  skillStatus.success = "";

  const parsedTargetHours = skillForm.targetHours
    ? Number(skillForm.targetHours)
    : null;
  const result = addSkill({
    name: skillForm.name,
    color: skillForm.color,
    goalType: skillForm.goalType,
    targetHours: parsedTargetHours,
  });

  if (!result.ok) {
    skillStatus.error = result.error;
    liveMessage.value = result.error;
    return;
  }

  skillStatus.success = `${result.skill.name} is ready to track.`;
  liveMessage.value = `Skill created: ${result.skill.name}.`;
  skillForm.name = "";
  skillForm.goalType = "";
  skillForm.targetHours = "";
  sessionForm.skillId = result.skill.id;
}
</script>
