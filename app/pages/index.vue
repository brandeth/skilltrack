<template>
  <div class="landing">
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
        <div class="landing-nav">
          <ThemeToggle />
          <NuxtLink to="/login" class="landing-nav__link">Sign in</NuxtLink>
          <NuxtLink to="/signup" class="btn btn--primary landing-nav__cta"
            >Sign up</NuxtLink
          >
        </div>
      </div>
    </header>

    <main>
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero__inner">
          <div class="hero__content">
            <div class="eyebrow">For learners who show up</div>
            <h1 id="hero-title" class="hero__title">
              See every hour you've invested in becoming better.
            </h1>
            <p class="hero__subtitle">
              Track practice sessions across any skill, build streaks that keep
              you accountable, and visualize your consistency with heatmaps and
              progress rings.
            </p>
            <div class="hero__actions">
              <NuxtLink to="/signup" class="btn btn--primary btn--lg">
                Start tracking free
              </NuxtLink>
              <NuxtLink
                to="/dashboard?guest=true"
                class="btn btn--secondary btn--lg"
              >
                Try as guest
              </NuxtLink>
            </div>
            <p class="hero__note helper-text">
              No credit card needed. Guest mode lets you explore instantly.
            </p>
          </div>

          <div class="hero__visual" aria-hidden="true">
            <div class="hero-showcase">
              <div class="showcase-card showcase-card--streak">
                <div class="showcase-card__eyebrow">Current streak</div>
                <div class="showcase-card__value">12 days</div>
                <div class="showcase-pill showcase-pill--active">Active</div>
              </div>
              <div class="showcase-card showcase-card--ring">
                <svg
                  class="showcase-ring"
                  width="100"
                  height="100"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="var(--color-border)"
                    stroke-width="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="var(--color-accent)"
                    stroke-width="8"
                    stroke-dasharray="264"
                    stroke-dashoffset="66"
                    stroke-linecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div class="showcase-ring__label">75%</div>
              </div>
              <div class="showcase-card showcase-card--hours">
                <div class="showcase-card__eyebrow">Total hours</div>
                <div class="showcase-card__value">47.5</div>
                <div class="helper-text">Across 6 skills</div>
              </div>
              <div class="showcase-card showcase-card--heatmap">
                <div class="showcase-card__eyebrow">90-day heatmap</div>
                <div class="showcase-heatmap">
                  <div
                    v-for="i in 35"
                    :key="i"
                    class="showcase-heatmap__cell"
                    :data-bucket="heatmapBuckets[i - 1]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="features" aria-labelledby="features-title">
        <div class="features__inner">
          <div class="eyebrow">What you get</div>
          <h2 id="features-title" class="features__title">
            Everything you need to stay consistent
          </h2>

          <div class="features__grid">
            <article class="feature-card panel">
              <div class="feature-card__icon" aria-hidden="true">🔥</div>
              <h3 class="feature-card__title">Streak tracking</h3>
              <p class="feature-card__copy">
                Build momentum with daily streaks. See when you're at risk of
                breaking one before it's too late.
              </p>
            </article>

            <article class="feature-card panel">
              <div class="feature-card__icon" aria-hidden="true">📊</div>
              <h3 class="feature-card__title">Heatmap calendar</h3>
              <p class="feature-card__copy">
                Visualize 90 days of practice at a glance. Color intensity shows
                how hard you worked each day.
              </p>
            </article>

            <article class="feature-card panel">
              <div class="feature-card__icon" aria-hidden="true">🎯</div>
              <h3 class="feature-card__title">Multi-skill dashboard</h3>
              <p class="feature-card__copy">
                Track guitar, Spanish, TypeScript, and more in one place. Set
                weekly or total-hours goals per skill.
              </p>
            </article>

            <article class="feature-card panel">
              <div class="feature-card__icon" aria-hidden="true">⚡</div>
              <h3 class="feature-card__title">30-second logging</h3>
              <p class="feature-card__copy">
                Log a session in seconds with flexible duration input. Quick
                presets and smart defaults keep friction low.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class="cta-section" aria-labelledby="cta-title">
        <div class="cta-section__inner">
          <h2 id="cta-title" class="cta-section__title">
            Start building your practice habit today
          </h2>
          <p class="cta-section__copy">
            Join learners who are making their invisible progress visible. Free,
            no setup required.
          </p>
          <div class="cta-section__actions">
            <NuxtLink to="/signup" class="btn btn--primary btn--lg">
              Create free account
            </NuxtLink>
            <NuxtLink
              to="/dashboard?guest=true"
              class="btn btn--secondary btn--lg"
            >
              Explore as guest
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>

    <footer class="landing-footer">
      <p class="helper-text">
        Built as a portfolio project.
        <a
          href="https://github.com"
          class="landing-footer__link"
          target="_blank"
          rel="noopener"
          >View source</a
        >
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

useHead({
  title: "SkillTrack — See every hour you've invested in becoming better",
});

// Decorative heatmap data for the hero visual
const heatmapBuckets = [
  0, 1, 0, 2, 3, 1, 0, 1, 2, 0, 0, 3, 2, 1, 0, 0, 1, 3, 2, 0, 1, 2, 3, 1, 0, 1,
  0, 2, 0, 1, 2, 3, 1, 0, 0,
];
</script>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Hero ──────────────────────────────────────────── */

.hero {
  padding: var(--space-16) 0 var(--space-20);
  overflow: hidden;
}

.hero__inner {
  width: min(100% - 2rem, var(--page-max-width));
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: var(--space-12);
  align-items: center;
}

.hero__content {
  display: grid;
  gap: var(--space-4);
}

.hero__title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(2.4rem, 5vw, var(--text-3xl));
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

.hero__subtitle {
  max-width: 50ch;
  color: var(--color-text-secondary);
  font-size: var(--text-lg);
  line-height: var(--leading-prose);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.hero__note {
  margin-top: var(--space-1);
}

.btn--lg {
  min-height: 3.25rem;
  padding: 0 var(--space-6);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
}

/* ── Hero Visual ───────────────────────────────────── */

.hero-showcase {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.showcase-card {
  padding: var(--space-5);
  border-radius: var(--radius-xl);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
  box-shadow: var(--shadow-md);
}

.showcase-card__eyebrow {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: var(--font-semibold);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-2);
}

.showcase-card__value {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-snug);
}

.showcase-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: var(--space-3);
  padding: 0.35rem 0.7rem;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.showcase-pill::before {
  content: "";
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: currentColor;
}

.showcase-pill--active {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
}

.showcase-card--ring {
  display: grid;
  place-items: center;
  position: relative;
}

.showcase-ring__label {
  position: absolute;
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
}

.showcase-heatmap {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.2rem;
  margin-top: var(--space-2);
}

.showcase-heatmap__cell {
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  background: var(--color-heatmap-empty);
}

.showcase-heatmap__cell[data-bucket="1"] {
  background: var(--color-heatmap-light);
}

.showcase-heatmap__cell[data-bucket="2"] {
  background: var(--color-heatmap-medium);
}

.showcase-heatmap__cell[data-bucket="3"] {
  background: var(--color-heatmap-heavy);
}

/* ── Features ──────────────────────────────────────── */

.features {
  padding: var(--space-16) 0;
  background: var(--color-bg-secondary);
}

.features__inner {
  width: min(100% - 2rem, var(--page-max-width));
  margin: 0 auto;
  text-align: center;
}

.features__title {
  margin: var(--space-3) 0 var(--space-10);
  font-family: var(--font-heading);
  font-size: clamp(1.8rem, 3.5vw, var(--text-2xl));
  line-height: var(--leading-tight);
}

.features__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: var(--space-6);
  text-align: left;
}

.feature-card {
  display: grid;
  gap: var(--space-3);
  align-content: start;
}

.feature-card__icon {
  font-size: 1.5rem;
}

.feature-card__title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
}

.feature-card__copy {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--leading-prose);
}

/* ── CTA Section ───────────────────────────────────── */

.cta-section {
  padding: var(--space-16) 0;
}

.cta-section__inner {
  width: min(100% - 2rem, var(--page-max-width));
  margin: 0 auto;
  text-align: center;
}

.cta-section__title {
  margin: 0 0 var(--space-4);
  font-family: var(--font-heading);
  font-size: clamp(1.8rem, 3.5vw, var(--text-2xl));
  line-height: var(--leading-tight);
}

.cta-section__copy {
  max-width: 48ch;
  margin: 0 auto var(--space-6);
  color: var(--color-text-secondary);
  font-size: var(--text-lg);
}

.cta-section__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
}

/* ── Navigation & Footer ──────────────────────────── */

.landing-nav {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.landing-nav__link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
}

.landing-nav__link:hover {
  color: var(--color-text-primary);
}

.landing-nav__cta {
  font-size: var(--text-sm);
  min-height: 2.5rem;
  text-decoration: none;
}

.landing-footer {
  margin-top: auto;
  padding: var(--space-8) 0;
  text-align: center;
  border-top: 1px solid var(--color-border-subtle);
}

.landing-footer__link {
  color: var(--color-accent);
  text-decoration: none;
}

.landing-footer__link:hover {
  text-decoration: underline;
}

/* ── Responsive ────────────────────────────────────── */

@media (max-width: 52rem) {
  .hero__inner {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }

  .hero {
    padding: var(--space-8) 0 var(--space-12);
  }

  .hero-showcase {
    max-width: 24rem;
  }

  .features,
  .cta-section {
    padding: var(--space-10) 0;
  }
}

@media (max-width: 30rem) {
  .hero__actions {
    flex-direction: column;
  }

  .hero__actions .btn {
    width: 100%;
  }

  .cta-section__actions {
    flex-direction: column;
    align-items: center;
  }

  .cta-section__actions .btn {
    width: 100%;
    max-width: 20rem;
  }
}
</style>
