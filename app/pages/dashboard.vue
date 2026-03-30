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
        <div class="topbar__actions">
          <ThemeToggle />
          <ActionDropdown @select="handleDropdownSelect" />
          <button
            v-if="isAuthenticated"
            class="btn btn--secondary topbar__signout"
            type="button"
            @click="handleSignOut"
          >
            Sign out
          </button>
        </div>
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
        <div v-if="!isAuthenticated" class="guest-banner" role="status">
          <p>
            You're exploring as a guest.
            <NuxtLink to="/signup" class="guest-banner__link">Sign up</NuxtLink>
            to save your progress.
          </p>
        </div>

        <section
          ref="heroPanelRef"
          class="hero-panel"
          aria-labelledby="dashboard-title"
          @mouseenter="onOrbEnter"
          @mousemove="onOrbMove"
          @mouseleave="onOrbLeave"
        >
          <div
            :class="['hero-orb', { 'hero-orb--pulse': orbPulsing }]"
            aria-hidden="true"
            :style="{ transform: `translate(${orbPos.x}px, ${orbPos.y}px)` }"
            @click="onOrbClick"
            @animationend="orbPulsing = false"
          />
          <div class="stack">
            <div class="eyebrow">Milestone 1 dashboard</div>
            <h1 id="dashboard-title" class="hero-panel__title">
              {{ greeting }}, learner.
            </h1>
            <p class="hero-panel__copy">
              You've practiced
              {{ weeklySkillCount }}
              {{ weeklySkillCount === 1 ? "skill" : "skills" }} this week. Keep
              it up!
            </p>
            <div class="hero-panel__actions">
              <button
                class="btn btn--primary"
                type="button"
                @click="sessionDialogOpen = true"
              >
                Log a session
              </button>
              <button
                class="btn btn--secondary"
                type="button"
                @click="skillDialogOpen = true"
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
                <div class="metric__value">
                  {{ animatedTotalHours.toFixed(1) }}
                </div>
              </div>
              <div class="metric">
                <div class="metric__label">Total sessions</div>
                <div class="metric__value">
                  {{ Math.round(animatedTotalSessions) }}
                </div>
              </div>
              <div class="metric">
                <div class="metric__label">Tracked skills</div>
                <div class="metric__value">
                  {{ Math.round(animatedSkillCount) }}
                </div>
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
          <button
            class="btn btn--primary"
            type="button"
            @click="skillDialogOpen = true"
          >
            Create a skill
          </button>
        </section>

        <section class="bento-grid" aria-label="Dashboard widgets">
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

              <div class="heatmap-shell">
                <div class="heatmap-weekdays">
                  <span>M</span>
                  <span>W</span>
                  <span>F</span>
                </div>
                <div
                  class="heatmap-grid"
                  role="grid"
                  aria-label="90-day practice heatmap"
                >
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
                      :aria-label="day.summary"
                      role="gridcell"
                      :style="{ '--cell-index': index }"
                    />
                    <div
                      v-else
                      class="heatmap-cell--blank"
                      role="gridcell"
                      aria-hidden="true"
                    />
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
                <div class="skill-card__actions">
                  <button
                    class="btn btn--sm btn--danger"
                    type="button"
                    @click="confirmDeleteSkill(summary.skill)"
                  >
                    Delete
                  </button>
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
                <button
                  class="btn btn--sm btn--danger session-item__delete"
                  type="button"
                  @click="confirmDeleteSession(session)"
                >
                  Delete
                </button>
              </li>
            </ul>

            <p v-else class="helper-text">
              Log a session to start your recent activity feed.
            </p>
          </article>
        </section>
      </div>
    </main>

    <AppDialog
      v-model:open="sessionDialogOpen"
      title="Log a session"
      eyebrow="Quick action"
    >
      <form class="form" @submit.prevent="handleLogSession">
        <div
          v-if="sessionLog.status.error"
          class="status-message status-message--error"
          role="alert"
        >
          {{ sessionLog.status.error }}
        </div>
        <div
          v-else-if="sessionLog.status.success"
          class="status-message status-message--success"
          role="status"
        >
          {{ sessionLog.status.success }}
        </div>
        <div
          v-if="sessionLog.status.warning"
          class="status-message status-message--warning"
          role="status"
        >
          {{ sessionLog.status.warning }}
        </div>

        <div class="field">
          <label for="dialog-skillId">Skill</label>
          <select
            id="dialog-skillId"
            v-model="sessionLog.form.skillId"
            :disabled="skills.length === 0"
            required
            aria-required="true"
          >
            <option value="" disabled>
              {{ skills.length ? "Select a skill" : "Add a skill first" }}
            </option>
            <option v-for="skill in skills" :key="skill.id" :value="skill.id">
              {{ skill.name }}
            </option>
          </select>
        </div>

        <div class="field-row quick-action-row">
          <div class="field field--duration">
            <label for="dialog-duration">Duration</label>
            <input
              id="dialog-duration"
              v-model="sessionLog.form.durationInput"
              inputmode="text"
              autocomplete="off"
              placeholder="45, 1.5, or 1h 30m"
              required
              aria-required="true"
              aria-describedby="dialog-duration-help"
            />
            <div class="duration-support">
              <div id="dialog-duration-help" class="helper-text">
                Flexible parsing supports minutes, decimal hours, or mixed hours
                and minutes.
              </div>
              <div class="quick-presets-group">
                <span id="dialog-duration-presets-label" class="label"
                  >Quick durations</span
                >
                <div
                  class="quick-presets"
                  role="group"
                  aria-labelledby="dialog-duration-presets-label"
                >
                  <button
                    v-for="preset in sessionLog.durationPresets"
                    :key="preset.label"
                    class="chip-button"
                    type="button"
                    :aria-pressed="
                      sessionLog.form.durationInput === preset.value
                    "
                    @click="sessionLog.form.durationInput = preset.value"
                  >
                    {{ preset.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="field field--date">
            <label for="dialog-date">Date</label>
            <input
              id="dialog-date"
              v-model="sessionLog.form.date"
              type="date"
              :max="todayKey"
              required
              aria-required="true"
            />
          </div>
        </div>

        <div class="field field--notes">
          <label for="dialog-notes">
            Notes <span class="field-label-note">Optional</span>
          </label>
          <textarea
            id="dialog-notes"
            v-model="sessionLog.form.notes"
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
    </AppDialog>

    <AppDialog
      v-model:open="skillDialogOpen"
      title="Create a skill"
      eyebrow="Recovery path"
    >
      <form class="form" @submit.prevent="handleAddSkill">
        <div
          v-if="skillCreate.status.error"
          class="status-message status-message--error"
          role="alert"
        >
          {{ skillCreate.status.error }}
        </div>
        <div
          v-else-if="skillCreate.status.success"
          class="status-message status-message--success"
          role="status"
        >
          {{ skillCreate.status.success }}
        </div>

        <div class="field">
          <label for="dialog-skill-name">Skill name</label>
          <input
            id="dialog-skill-name"
            v-model="skillCreate.form.name"
            type="text"
            autocomplete="off"
            placeholder="TypeScript, Piano, Cooking"
            required
            aria-required="true"
          />
        </div>

        <div class="field-row">
          <div class="field">
            <label for="dialog-skill-color">Accent color</label>
            <select id="dialog-skill-color" v-model="skillCreate.form.color">
              <option
                v-for="color in skillCreate.availableColors"
                :key="color"
                :value="color"
              >
                {{ color }}
              </option>
            </select>
          </div>

          <div class="field">
            <label for="dialog-goal-type">Goal type</label>
            <select id="dialog-goal-type" v-model="skillCreate.form.goalType">
              <option value="">No goal yet</option>
              <option value="weekly">Weekly</option>
              <option value="total">Total hours</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label for="dialog-goal-hours">Goal hours</label>
          <input
            id="dialog-goal-hours"
            v-model="skillCreate.form.targetHours"
            type="number"
            min="1"
            step="0.5"
            placeholder="5"
          />
        </div>

        <button class="btn btn--secondary" type="submit">Create skill</button>
      </form>
    </AppDialog>

    <AppDialog
      :open="!!pendingDeleteSkill"
      title="Delete skill"
      eyebrow="Confirmation"
      @update:open="pendingDeleteSkill = null"
    >
      <p>
        Are you sure you want to delete
        <strong>{{ pendingDeleteSkill?.name }}</strong
        >? All sessions for this skill will also be removed. This cannot be
        undone.
      </p>
      <div class="dialog-confirm-actions">
        <button
          class="btn btn--danger"
          type="button"
          @click="executeDeleteSkill"
        >
          Delete skill
        </button>
        <button
          class="btn btn--secondary"
          type="button"
          @click="pendingDeleteSkill = null"
        >
          Cancel
        </button>
      </div>
    </AppDialog>

    <AppDialog
      :open="!!pendingDeleteSession"
      title="Delete session"
      eyebrow="Confirmation"
      @update:open="pendingDeleteSession = null"
    >
      <p>
        Delete this
        <strong>{{ pendingDeleteSession?.skillName }}</strong> session ({{
          pendingDeleteSession
            ? formatMinutes(pendingDeleteSession.durationMinutes)
            : ""
        }}
        on
        {{
          pendingDeleteSession ? formatDateLong(pendingDeleteSession.date) : ""
        }})? This cannot be undone.
      </p>
      <div class="dialog-confirm-actions">
        <button
          class="btn btn--danger"
          type="button"
          @click="executeDeleteSession"
        >
          Delete session
        </button>
        <button
          class="btn btn--secondary"
          type="button"
          @click="pendingDeleteSession = null"
        >
          Cancel
        </button>
      </div>
    </AppDialog>

    <div class="sr-only" aria-live="polite">{{ liveMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import type {
  Skill,
  SkillSummary,
  SessionWithSkill,
} from "~/utils/tracker-types";

const user = useSupabaseUser();
const isAuthenticated = computed(() => !!user.value);
const supabaseClient = useSupabaseClient();

async function handleSignOut() {
  await supabaseClient.auth.signOut();
  navigateTo("/login");
}

const {
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
  deleteSkill,
  deleteSession,
} = useSkillTracker();

const animatedTotalHours = useCountUp(
  computed(() => parseFloat(totalHours.value) || 0),
);
const animatedTotalSessions = useCountUp(computed(() => totalSessions.value));
const animatedSkillCount = useCountUp(computed(() => skills.value.length));

const sessionLog = useSessionForm();
const skillCreate = useSkillForm();

useHead({
  title: "Dashboard — SkillTrack",
});

const liveMessage = ref("");
const sessionDialogOpen = ref(false);
const skillDialogOpen = ref(false);

const heroPanelRef = ref<HTMLElement | null>(null);
const orbPos = reactive({ x: 0, y: 0 });
const orbTarget = reactive({ x: 0, y: 0 });
const orbGoal = reactive({ x: 0, y: 0 });
const orbVel = reactive({ x: 0, y: 0 });
const orbHovered = ref(false);
const orbPulsing = ref(false);
let orbRaf = 0;
let prevX = 0;
let prevY = 0;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function pickWanderGoal() {
  const el = heroPanelRef.value;
  if (!el) return;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  orbGoal.x = Math.random() * w - 112;
  orbGoal.y = Math.random() * h - 112;
}

function pickWanderGoalFromHeading() {
  const el = heroPanelRef.value;
  if (!el) return;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const speed = Math.sqrt(orbVel.x ** 2 + orbVel.y ** 2);
  const drift = 300 + Math.random() * 200;
  if (speed > 0.05) {
    const nx = orbVel.x / speed;
    const ny = orbVel.y / speed;
    const spread = (Math.random() - 0.5) * 1.2;
    const cos = Math.cos(spread);
    const sin = Math.sin(spread);
    const dx = nx * cos - ny * sin;
    const dy = nx * sin + ny * cos;
    orbGoal.x = clamp(orbPos.x + dx * drift, -112, w - 112);
    orbGoal.y = clamp(orbPos.y + dy * drift, -112, h - 112);
  } else {
    pickWanderGoal();
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function orbLoop() {
  const steerFactor = 0.006;
  orbTarget.x = lerp(orbTarget.x, orbGoal.x, steerFactor);
  orbTarget.y = lerp(orbTarget.y, orbGoal.y, steerFactor);

  const moveFactor = orbHovered.value ? 0.004 : 0.0015;
  orbPos.x = lerp(orbPos.x, orbTarget.x, moveFactor);
  orbPos.y = lerp(orbPos.y, orbTarget.y, moveFactor);

  orbVel.x = orbPos.x - prevX;
  orbVel.y = orbPos.y - prevY;
  prevX = orbPos.x;
  prevY = orbPos.y;

  if (
    !orbHovered.value &&
    Math.abs(orbTarget.x - orbGoal.x) < 5 &&
    Math.abs(orbTarget.y - orbGoal.y) < 5
  ) {
    pickWanderGoal();
  }

  orbRaf = requestAnimationFrame(orbLoop);
}

let orbLeaveTimeout = 0;

function onOrbEnter() {
  clearTimeout(orbLeaveTimeout);
  orbHovered.value = true;
}

function onOrbMove(e: MouseEvent) {
  const el = heroPanelRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  orbGoal.x = e.clientX - rect.left - 112;
  orbGoal.y = e.clientY - rect.top - 112;
}

function onOrbLeave() {
  orbLeaveTimeout = window.setTimeout(() => {
    orbHovered.value = false;
    pickWanderGoalFromHeading();
  }, 800);
}

function onOrbClick() {
  orbPulsing.value = false;
  void document.querySelector(".hero-orb")?.offsetWidth;
  orbPulsing.value = true;
}

onMounted(() => {
  const el = heroPanelRef.value;
  if (el) {
    orbPos.x = el.offsetWidth - 112;
    orbPos.y = el.offsetHeight - 112;
    orbTarget.x = orbPos.x;
    orbTarget.y = orbPos.y;
    prevX = orbPos.x;
    prevY = orbPos.y;
    pickWanderGoal();
  }
  orbRaf = requestAnimationFrame(orbLoop);
});

onUnmounted(() => {
  cancelAnimationFrame(orbRaf);
});

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
});

const weeklySkillCount = computed(() => {
  const weekStart = toDateKey(startOfWeek(parseDateKey(todayKey.value)));
  const uniqueSkills = new Set(
    sessions.value.filter((s) => s.date >= weekStart).map((s) => s.skillId),
  );
  return uniqueSkills.size;
});

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

function handleDropdownSelect(action: "session" | "skill") {
  if (action === "session") {
    sessionDialogOpen.value = true;
  } else {
    skillDialogOpen.value = true;
  }
}

watch(sessionDialogOpen, (open) => {
  if (open) {
    sessionLog.status.error = "";
    sessionLog.status.success = "";
    sessionLog.status.warning = "";
  }
});

watch(skillDialogOpen, (open) => {
  if (open) {
    skillCreate.status.error = "";
    skillCreate.status.success = "";
  }
});

function handleLogSession() {
  const result = sessionLog.submit();
  liveMessage.value = result.liveAnnouncement;
  if (result.ok) {
    setTimeout(() => {
      sessionDialogOpen.value = false;
    }, 300);
  }
}

function handleAddSkill() {
  const result = skillCreate.submit();
  liveMessage.value = result.liveAnnouncement;
  if (result.ok) {
    skillDialogOpen.value = false;
    sessionLog.form.skillId = result.skill.id;
  }
}

const pendingDeleteSkill = ref<Skill | null>(null);
const pendingDeleteSession = ref<SessionWithSkill | null>(null);

function confirmDeleteSkill(skill: Skill) {
  pendingDeleteSkill.value = skill;
}

function executeDeleteSkill() {
  if (pendingDeleteSkill.value) {
    deleteSkill(pendingDeleteSkill.value.id);
    liveMessage.value = `Skill deleted: ${pendingDeleteSkill.value.name}.`;
    pendingDeleteSkill.value = null;
  }
}

function confirmDeleteSession(session: SessionWithSkill) {
  pendingDeleteSession.value = session;
}

function executeDeleteSession() {
  if (pendingDeleteSession.value) {
    deleteSession(pendingDeleteSession.value.id);
    liveMessage.value = `Session deleted.`;
    pendingDeleteSession.value = null;
  }
}
</script>
