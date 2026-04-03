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
          <ActionDropdown
            :include-sign-out="showMobileSignOut"
            @select="handleDropdownSelect"
          />
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
            v-for="orb in heroOrbs"
            :key="orb.id"
            :class="['hero-orb', { 'hero-orb--pulse': orb.pulsing }]"
            aria-hidden="true"
            :style="{
              transform: `translate(${orb.x}px, ${orb.y}px) scale(${orb.scale})`,
              '--hero-orb-color': orb.color,
              '--hero-orb-opacity': orb.opacity.toString(),
            }"
            @click="pulseHeroOrb(orb.id)"
            @animationend="onOrbPulseEnd(orb.id)"
          />
          <div class="hero-panel__top">
            <div class="stack">
              <div class="eyebrow">Milestone 1 dashboard</div>
              <h1 id="dashboard-title" class="hero-panel__title">
                {{ greeting }}, learner.
              </h1>
              <div class="hero-panel__copy-row">
                <p class="hero-panel__copy">
                  {{ weeklySkillCount }}
                  {{ weeklySkillCount === 1 ? "skill" : "skills" }} practiced
                  this week
                </p>
                <div
                  :class="['status-pill', streakClass(overallStreak.status)]"
                >
                  {{ overallStreakLabel }}
                </div>
              </div>
            </div>
            <div class="hero-panel__actions">
              <button
                class="btn btn--primary"
                type="button"
                @click="sessionDialogOpen = true"
              >
                Log session
              </button>
              <button
                class="btn btn--secondary"
                type="button"
                @click="skillDialogOpen = true"
              >
                + Add skill
              </button>
            </div>
          </div>

          <div class="metric-grid">
            <div class="metric">
              <div class="metric__label">Total hours</div>
              <div class="metric__value">
                {{ animatedTotalHours.toFixed(1) }}
              </div>
              <div class="metric__sublabel">↑ across all skills</div>
            </div>
            <div class="metric">
              <div class="metric__label">Sessions</div>
              <div class="metric__value">
                {{ Math.round(animatedTotalSessions) }}
              </div>
              <div class="metric__sublabel">
                avg
                {{
                  totalSessions > 0
                    ? Math.round((parseFloat(totalHours) * 60) / totalSessions)
                    : 0
                }}
                min each
              </div>
            </div>
            <div class="metric">
              <div class="metric__label">Tracked skills</div>
              <div class="metric__value">
                {{ Math.round(animatedSkillCount) }}
              </div>
              <div class="metric__sublabel">
                {{
                  featuredSkill
                    ? featuredSkill.skill.name + " leading"
                    : "No leader yet"
                }}
              </div>
            </div>
            <div class="metric">
              <div class="metric__label">Best streak</div>
              <div class="metric__value">
                {{ Math.round(animatedBestStreak) }}
              </div>
              <div class="metric__sublabel">
                {{
                  bestStreak.skillName
                    ? "days · " + bestStreak.skillName
                    : "No streaks yet"
                }}
              </div>
            </div>
          </div>

          <div v-if="featuredSkill" class="hero-panel__featured-bar">
            <p class="hero-panel__featured-text">
              <strong>{{ featuredSkill.skill.name }}</strong> is leading — most
              hours, most recent session, strongest streak momentum.
            </p>
            <button
              class="btn btn--sm btn--secondary"
              type="button"
              @click="scrollToFeatured"
            >
              View skill ↗
            </button>
          </div>
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
          <article
            class="panel panel--featured"
            :style="{ '--skill-accent': featuredSkill?.skill.color }"
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
                <div class="featured-card__ring-wrap">
                  <ProgressRing
                    :value="featuredSkill.progressValue"
                    :max="featuredSkill.progressMax"
                    :size="132"
                    :stroke="10"
                    :color="featuredSkill.skill.color"
                    :label="featuredSkill.progressAriaLabel"
                    caption="of weekly goal"
                  />
                </div>
                <div class="featured-card__headline">
                  <div class="featured-card__big-stat">
                    <span class="featured-card__number">
                      {{ formatHours(featuredSkill.totalMinutes) }}
                    </span>
                    <span class="featured-card__unit">hours total</span>
                  </div>
                  <div class="featured-card__big-stat">
                    <span class="featured-card__number">
                      {{ featuredSkill.sessionCount }}
                    </span>
                    <span class="featured-card__unit">sessions</span>
                  </div>
                </div>
              </div>

              <dl
                class="featured-card__stats"
                :aria-label="`${featuredSkill.skill.name} key stats`"
              >
                <div class="featured-card__stat featured-card__stat--weekly">
                  <dt>This week</dt>
                  <dd>{{ featuredSkill.progressCaption }}</dd>
                </div>
                <div class="featured-card__stat">
                  <dt>Current streak</dt>
                  <dd>{{ featuredSkill.currentStreak }} days</dd>
                </div>
                <div class="featured-card__stat">
                  <dt>Best streak</dt>
                  <dd>{{ featuredSkill.longestStreak }} days</dd>
                </div>
                <div class="featured-card__stat">
                  <dt>Last practiced</dt>
                  <dd>
                    {{
                      featuredSkill.lastPracticedAt
                        ? formatDateLong(featuredSkill.lastPracticedAt)
                        : "No sessions yet"
                    }}
                  </dd>
                </div>
              </dl>
            </div>

            <p v-else class="helper-text">
              Create a skill and log a session to unlock your dashboard
              highlights.
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
                <div class="session-item__summary">
                  <div class="session-item__title-row">
                    <span class="session-item__title-group">
                      <span
                        class="skill-swatch"
                        :style="{ backgroundColor: session.skillColor }"
                        aria-hidden="true"
                      />
                      <strong>{{ session.skillName }}</strong>
                    </span>
                  </div>
                  <div class="session-item__meta">
                    {{ formatMinutes(session.durationMinutes) }} on
                    {{ formatDateLong(session.date) }}
                  </div>
                </div>
                <button
                  class="btn btn--sm btn--danger session-item__delete"
                  type="button"
                  aria-label="Delete session"
                  @click="confirmDeleteSession(session)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
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
                :style="{ '--skill-color': summary.skill.color }"
              >
                <SkillCardOrb />
                <div class="skill-card__header">
                  <div class="skill-card__title-row">
                    <span
                      class="skill-swatch"
                      :style="{ backgroundColor: summary.skill.color }"
                      aria-hidden="true"
                    />
                    <h3 class="skill-card__name">{{ summary.skill.name }}</h3>
                  </div>
                  <div class="skill-card__best-badge">
                    <span aria-hidden="true">🏆</span> Best:
                    {{ summary.longestStreak }} days
                  </div>
                </div>

                <div class="skill-card__progress">
                  <div class="skill-card__progress-header">
                    <span class="label">This week</span>
                    <span class="skill-card__progress-value">{{
                      summary.progressCaption
                    }}</span>
                  </div>
                  <div
                    class="skill-card__progress-bar"
                    role="progressbar"
                    :aria-valuenow="summary.progressValue"
                    :aria-valuemin="0"
                    :aria-valuemax="summary.progressMax"
                    :aria-label="summary.progressAriaLabel"
                  >
                    <div
                      class="skill-card__progress-fill"
                      :style="{
                        width: summary.progressMax
                          ? Math.min(
                              (summary.progressValue / summary.progressMax) *
                                100,
                              100,
                            ) + '%'
                          : '0%',
                      }"
                    />
                  </div>
                </div>

                <div
                  class="skill-card__metrics"
                  :aria-label="`${summary.skill.name} totals`"
                >
                  <div class="skill-card__metric">
                    <span class="label">Total hours</span>
                    <strong>{{ formatHours(summary.totalMinutes) }}</strong>
                  </div>
                  <div class="skill-card__metric">
                    <span class="label">Sessions</span>
                    <strong>{{ summary.sessionCount }}</strong>
                  </div>
                </div>

                <div class="skill-card__actions">
                  <button
                    class="btn btn--sm btn--secondary"
                    type="button"
                    @click="restartStreak(summary.skill)"
                  >
                    Restart streak ↗
                  </button>
                  <button
                    class="btn btn--sm btn--secondary"
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

        <FormSingleSelect
          v-model="sessionLog.form.skillId"
          input-id="dialog-skillId"
          label="Skill"
          :options="sessionSkillOptions"
          :placeholder="skills.length ? 'Select a skill' : 'Add a skill first'"
          :disabled="skills.length === 0"
          required
        />

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
import FormSingleSelect from "~/components/FormSingleSelect.vue";
import type {
  Skill,
  SkillSummary,
  SessionWithSkill,
} from "~/utils/tracker-types";

const user = useSupabaseUser();
const isAuthenticated = computed(() => !!user.value);
const supabaseClient = useSupabaseClient();
const mobileActionsQuery = "(max-width: 47.999rem)";
const isMobileViewport = ref(false);
const showMobileSignOut = computed(
  () => isAuthenticated.value && isMobileViewport.value,
);

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
const bestStreak = computed(() => {
  let best = 0;
  let skillName = "";
  for (const s of skillSummaries.value) {
    if (s.longestStreak > best) {
      best = s.longestStreak;
      skillName = s.skill.name;
    }
  }
  return { days: best, skillName };
});
const animatedBestStreak = useCountUp(computed(() => bestStreak.value.days));

const sessionLog = useSessionForm();
const skillCreate = useSkillForm();
const sessionSkillOptions = computed(() =>
  skills.value.map((skill) => ({
    value: skill.id,
    label: skill.name,
    color: skill.color,
  })),
);

useHead({
  title: "Dashboard — SkillTrack",
});

const liveMessage = ref("");
const sessionDialogOpen = ref(false);
const skillDialogOpen = ref(false);

const heroPanelRef = ref<HTMLElement | null>(null);
const HERO_ORB_HALF = 112;

interface HeroOrbState {
  id: string;
  color: string;
  seeded: boolean;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  goalX: number;
  goalY: number;
  velX: number;
  velY: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  opacity: number;
  steerFactor: number;
  moveFactor: number;
  wanderDrift: number;
  pulsing: boolean;
}

const heroOrbs = ref<HeroOrbState[]>([]);
const orbHovered = ref(false);
let orbRaf = 0;
let mobileViewportMediaQuery: MediaQueryList | null = null;

function updateMobileViewport(event?: MediaQueryList | MediaQueryListEvent) {
  isMobileViewport.value = event?.matches ?? false;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function getHeroOrbArea() {
  const el = heroPanelRef.value;
  if (!el) return null;

  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const minX = width < 720 ? -HERO_ORB_HALF : width * 0.18 - HERO_ORB_HALF;

  return {
    width,
    height,
    minX,
    maxX: width - HERO_ORB_HALF,
    minY: -HERO_ORB_HALF,
    maxY: height - HERO_ORB_HALF,
  };
}

function getHeroOrbProfile(index: number, total: number) {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2;
  const radius = 28 + (index % 4) * 18;

  return {
    offsetX: Math.cos(angle) * radius,
    offsetY: Math.sin(angle) * radius * 0.65,
    scale: Math.max(0.62, 1 - index * 0.035),
    opacity: Math.max(0.16, 0.44 - index * 0.012),
    steerFactor: 0.005 + (index % 4) * 0.00045,
    moveFactor: 0.0012 + (index % 5) * 0.0002,
    wanderDrift: 220 + (index % 4) * 32,
  };
}

function getInitialHeroOrbPosition(
  index: number,
  total: number,
  area = getHeroOrbArea(),
) {
  if (!area) {
    return { x: 0, y: 0 };
  }

  const xMin =
    area.width < 720
      ? area.minX
      : Math.max(area.minX, area.width * 0.42 - HERO_ORB_HALF);
  const xMax = area.maxX;
  const yMin =
    area.width < 720
      ? Math.max(area.minY, area.height * 0.22 - HERO_ORB_HALF)
      : area.minY;
  const yMax =
    area.width < 720
      ? Math.min(area.maxY, area.height * 0.84 - HERO_ORB_HALF)
      : Math.min(area.maxY, area.height * 0.76 - HERO_ORB_HALF);
  const contentExclusion =
    area.width < 720
      ? {
          minX: area.width * 0.06 - HERO_ORB_HALF,
          maxX: area.width * 0.94 - HERO_ORB_HALF,
          minY: area.height * 0.02 - HERO_ORB_HALF,
          maxY: area.height * 0.34 - HERO_ORB_HALF,
        }
      : {
          minX: area.width * 0.02 - HERO_ORB_HALF,
          maxX: area.width * 0.58 - HERO_ORB_HALF,
          minY: area.height * 0.02 - HERO_ORB_HALF,
          maxY: area.height * 0.44 - HERO_ORB_HALF,
        };

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const x = xMin + Math.random() * Math.max(xMax - xMin, 0);
    const y = yMin + Math.random() * Math.max(yMax - yMin, 0);
    const overlapsContent =
      x < contentExclusion.maxX &&
      x + HERO_ORB_HALF * 2 > contentExclusion.minX &&
      y < contentExclusion.maxY &&
      y + HERO_ORB_HALF * 2 > contentExclusion.minY;

    if (!overlapsContent) {
      return {
        x: clamp(x, area.minX, area.maxX),
        y: clamp(y, area.minY, area.maxY),
      };
    }
  }

  const fallbackProgress = total <= 1 ? 0.5 : index / Math.max(total - 1, 1);

  return {
    x: clamp(
      xMin + (xMax - xMin) * (0.2 + fallbackProgress * 0.6),
      area.minX,
      area.maxX,
    ),
    y: clamp(
      yMin + (yMax - yMin) * (0.3 + Math.random() * 0.4),
      area.minY,
      area.maxY,
    ),
  };
}

function pickWanderGoal(orb: HeroOrbState, index: number, total: number) {
  const area = getHeroOrbArea();
  if (!area) return;

  const angle = Math.random() * Math.PI * 2;
  const radiusX = Math.max(area.width * 0.14, 72) + (index % 3) * 20;
  const radiusY = Math.max(area.height * 0.18, 64) + (index % 2) * 18;
  const centerX = area.width * (area.width < 720 ? 0.5 : 0.72);
  const centerY = area.height * (area.width < 720 ? 0.46 : 0.36);

  orb.goalX = clamp(
    centerX + Math.cos(angle) * radiusX - HERO_ORB_HALF,
    area.minX,
    area.maxX,
  );
  orb.goalY = clamp(
    centerY + Math.sin(angle) * radiusY - HERO_ORB_HALF,
    area.minY,
    area.maxY,
  );
}

function pickWanderGoalFromHeading() {
  const area = getHeroOrbArea();
  if (!area) return;

  const orbCount = heroOrbs.value.length;
  if (!orbCount) return;

  const centroid = heroOrbs.value.reduce(
    (sum, orb) => {
      sum.x += orb.x + HERO_ORB_HALF;
      sum.y += orb.y + HERO_ORB_HALF;
      return sum;
    },
    { x: 0, y: 0 },
  );
  centroid.x /= orbCount;
  centroid.y /= orbCount;

  const dispersionDistance = Math.max(
    Math.min(area.width, area.height) * 0.18,
    120,
  );
  const dispersionStep = Math.max(
    Math.min(area.width, area.height) * 0.028,
    18,
  );

  heroOrbs.value.forEach((orb, index) => {
    const orbCenterX = orb.x + HERO_ORB_HALF;
    const orbCenterY = orb.y + HERO_ORB_HALF;
    let dx = orbCenterX - centroid.x;
    let dy = orbCenterY - centroid.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    if (distance > 1) {
      dx /= distance;
      dy /= distance;
    } else {
      const fallbackAngle =
        Math.atan2(orb.offsetY, orb.offsetX) ||
        (index / Math.max(orbCount, 1)) * Math.PI * 2;
      dx = Math.cos(fallbackAngle);
      dy = Math.sin(fallbackAngle);
    }

    const targetRadius =
      Math.max(distance, 28) +
      dispersionDistance +
      (index % 3) * dispersionStep;
    orb.goalX = clamp(
      centroid.x + dx * targetRadius - HERO_ORB_HALF,
      area.minX,
      area.maxX,
    );
    orb.goalY = clamp(
      centroid.y + dy * targetRadius - HERO_ORB_HALF,
      area.minY,
      area.maxY,
    );
  });
}

function syncHeroOrbs() {
  const existingOrbs = new Map(heroOrbs.value.map((orb) => [orb.id, orb]));
  const total = skills.value.length;
  const area = getHeroOrbArea();

  heroOrbs.value = skills.value.map((skill, index) => {
    const profile = getHeroOrbProfile(index, total);
    const existingOrb = existingOrbs.get(skill.id);

    if (existingOrb) {
      existingOrb.color = skill.color;
      existingOrb.offsetX = profile.offsetX;
      existingOrb.offsetY = profile.offsetY;
      existingOrb.scale = profile.scale;
      existingOrb.opacity = profile.opacity;
      existingOrb.steerFactor = profile.steerFactor;
      existingOrb.moveFactor = profile.moveFactor;
      existingOrb.wanderDrift = profile.wanderDrift;

      if (!existingOrb.seeded && area) {
        const initialPosition = getInitialHeroOrbPosition(index, total, area);

        existingOrb.x = initialPosition.x;
        existingOrb.y = initialPosition.y;
        existingOrb.targetX = initialPosition.x;
        existingOrb.targetY = initialPosition.y;
        existingOrb.goalX = initialPosition.x;
        existingOrb.goalY = initialPosition.y;
        existingOrb.seeded = true;
      }

      return existingOrb;
    }

    const initialPosition = getInitialHeroOrbPosition(index, total, area);

    return {
      id: skill.id,
      color: skill.color,
      seeded: Boolean(area),
      x: initialPosition.x,
      y: initialPosition.y,
      targetX: initialPosition.x,
      targetY: initialPosition.y,
      goalX: initialPosition.x,
      goalY: initialPosition.y,
      velX: 0,
      velY: 0,
      pulsing: false,
      ...profile,
    };
  });

  if (!orbHovered.value) {
    heroOrbs.value.forEach((orb, index) => {
      pickWanderGoal(orb, index, total);
    });
  }
}

function pulseHeroOrb(orbId: string) {
  const orb = heroOrbs.value.find((item) => item.id === orbId);
  if (!orb) return;

  orb.pulsing = false;

  requestAnimationFrame(() => {
    const nextOrb = heroOrbs.value.find((item) => item.id === orbId);
    if (nextOrb) {
      nextOrb.pulsing = true;
    }
  });
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function orbLoop() {
  heroOrbs.value.forEach((orb, index) => {
    orb.targetX = lerp(orb.targetX, orb.goalX, orb.steerFactor);
    orb.targetY = lerp(orb.targetY, orb.goalY, orb.steerFactor);

    const moveFactor = orbHovered.value
      ? Math.min(orb.moveFactor * 2.8, 0.004)
      : orb.moveFactor;
    const nextX = lerp(orb.x, orb.targetX, moveFactor);
    const nextY = lerp(orb.y, orb.targetY, moveFactor);

    orb.velX = nextX - orb.x;
    orb.velY = nextY - orb.y;
    orb.x = nextX;
    orb.y = nextY;

    if (
      !orbHovered.value &&
      Math.abs(orb.targetX - orb.goalX) < 5 &&
      Math.abs(orb.targetY - orb.goalY) < 5
    ) {
      pickWanderGoal(orb, index, heroOrbs.value.length);
    }
  });

  orbRaf = requestAnimationFrame(orbLoop);
}

let orbLeaveTimeout = 0;

function onOrbEnter() {
  clearTimeout(orbLeaveTimeout);
  orbHovered.value = true;
}

function onOrbMove(e: MouseEvent) {
  const el = heroPanelRef.value;
  const area = getHeroOrbArea();
  if (!el || !area) return;

  const rect = el.getBoundingClientRect();
  const baseX = e.clientX - rect.left - HERO_ORB_HALF;
  const baseY = e.clientY - rect.top - HERO_ORB_HALF;

  heroOrbs.value.forEach((orb) => {
    orb.goalX = clamp(baseX + orb.offsetX, area.minX, area.maxX);
    orb.goalY = clamp(baseY + orb.offsetY, area.minY, area.maxY);
  });
}

function onOrbLeave() {
  orbLeaveTimeout = window.setTimeout(() => {
    orbHovered.value = false;
    pickWanderGoalFromHeading();
  }, 800);
}

function onOrbPulseEnd(orbId: string) {
  const orb = heroOrbs.value.find((item) => item.id === orbId);
  if (orb) {
    orb.pulsing = false;
  }
}

async function syncHeroOrbsAfterRender() {
  await nextTick();

  if (!hydrated.value || !heroPanelRef.value) {
    return;
  }

  syncHeroOrbs();
}

onMounted(() => {
  syncHeroOrbs();
  orbRaf = requestAnimationFrame(orbLoop);

  mobileViewportMediaQuery = window.matchMedia(mobileActionsQuery);
  updateMobileViewport(mobileViewportMediaQuery);
  mobileViewportMediaQuery.addEventListener("change", updateMobileViewport);
});

onUnmounted(() => {
  clearTimeout(orbLeaveTimeout);
  cancelAnimationFrame(orbRaf);
  mobileViewportMediaQuery?.removeEventListener("change", updateMobileViewport);
});

watch(
  () => skills.value.map((skill) => `${skill.id}:${skill.color}`),
  () => {
    syncHeroOrbs();
  },
  { immediate: true },
);

watch(
  [hydrated, heroPanelRef],
  ([isHydrated, heroPanel]) => {
    if (!isHydrated || !heroPanel) {
      return;
    }

    void syncHeroOrbsAfterRender();
  },
  { flush: "post" },
);

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

async function handleDropdownSelect(action: "session" | "skill" | "signout") {
  if (action === "session") {
    sessionDialogOpen.value = true;
    return;
  }

  if (action === "skill") {
    skillDialogOpen.value = true;
    return;
  }

  await handleSignOut();
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

function restartStreak(skill: Skill) {
  sessionLog.form.skillId = skill.id;
  sessionDialogOpen.value = true;
}

function scrollToFeatured() {
  document
    .getElementById("featured-title")
    ?.scrollIntoView({ behavior: "smooth" });
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
