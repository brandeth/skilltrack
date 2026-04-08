<template>
  <div ref="landingRoot" class="landing">
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
                <div class="showcase-streak-top">
                  <div class="showcase-card__eyebrow">Current streak</div>
                  <div class="showcase-pill showcase-pill--active">Active</div>
                </div>
                <div class="showcase-streak-hero">
                  <span class="showcase-streak-fire" aria-hidden="true"
                    >🔥</span
                  >
                  <span class="showcase-card__value">12 days</span>
                </div>
                <div class="showcase-streak-detail">
                  <span class="helper-text">Best: 18 days</span>
                  <span class="helper-text">·</span>
                  <span class="helper-text">3 skills today</span>
                </div>
              </div>
              <div class="showcase-card showcase-card--ring">
                <div class="showcase-card__eyebrow">Weekly goal</div>
                <div class="showcase-ring-wrap">
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
                <div class="showcase-ring__caption">3.75 / 5 hrs this week</div>
              </div>
              <div class="showcase-card showcase-card--hours">
                <div class="showcase-card__eyebrow">Total hours</div>
                <div class="showcase-card__value">47.5</div>
                <div class="helper-text">Across 6 skills</div>
                <ul class="showcase-hours-bars">
                  <li class="showcase-hours-bar">
                    <span class="showcase-hours-bar__name">Spanish</span>
                    <div class="showcase-hours-bar__track">
                      <div
                        class="showcase-hours-bar__fill showcase-hours-bar__fill--spanish"
                      />
                    </div>
                    <span class="showcase-hours-bar__val">14.2</span>
                  </li>
                  <li class="showcase-hours-bar">
                    <span class="showcase-hours-bar__name">Guitar</span>
                    <div class="showcase-hours-bar__track">
                      <div
                        class="showcase-hours-bar__fill showcase-hours-bar__fill--guitar"
                      />
                    </div>
                    <span class="showcase-hours-bar__val">10.3</span>
                  </li>
                  <li class="showcase-hours-bar">
                    <span class="showcase-hours-bar__name">TypeScript</span>
                    <div class="showcase-hours-bar__track">
                      <div
                        class="showcase-hours-bar__fill showcase-hours-bar__fill--typescript"
                      />
                    </div>
                    <span class="showcase-hours-bar__val">8.2</span>
                  </li>
                </ul>
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

const landingRoot = ref<HTMLElement | null>(null);

let activeAnimations: Array<{
  revert: (config?: object) => unknown;
  kill?: () => unknown;
}> = [];

// Decorative heatmap data for the hero visual
const heatmapBuckets = [
  0, 1, 0, 2, 3, 1, 0, 1, 2, 0, 0, 3, 2, 1, 0, 0, 1, 3, 2, 0, 1, 2, 3, 1, 0, 1,
  0, 2, 0, 1, 2, 3, 1, 0, 0,
];

onMounted(async () => {
  if (!landingRoot.value) {
    return;
  }

  await nextTick();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);

  if (!landingRoot.value) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const select = gsap.utils.selector(landingRoot.value);
  const clearProps = "transform,opacity,visibility";

  const heroTimeline = gsap.timeline({
    defaults: {
      duration: 0.72,
      ease: "power2.out",
    },
  });

  heroTimeline
    .from(select(".topbar__inner"), {
      y: -18,
      autoAlpha: 0,
      duration: 0.48,
      clearProps,
    })
    .from(
      select(".hero__content > *"),
      {
        y: 24,
        autoAlpha: 0,
        stagger: 0.08,
        clearProps,
      },
      "-=0.16",
    )
    .from(
      select(".showcase-card"),
      {
        y: 28,
        autoAlpha: 0,
        scale: 0.985,
        stagger: 0.1,
        duration: 0.64,
        clearProps,
      },
      "-=0.42",
    );

  activeAnimations.push(heroTimeline);

  const featureCards = select(".feature-card");
  const featuresSection = select(".features")[0];
  if (featureCards.length && featuresSection) {
    activeAnimations.push(
      gsap.from(featureCards, {
        y: 24,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.58,
        ease: "power2.out",
        clearProps,
        scrollTrigger: {
          trigger: featuresSection,
          start: "top 78%",
          once: true,
        },
      }),
    );
  }

  const ctaItems = select(".cta-section__inner > *");
  const ctaSection = select(".cta-section")[0];
  if (ctaItems.length && ctaSection) {
    activeAnimations.push(
      gsap.from(ctaItems, {
        y: 20,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.56,
        ease: "power2.out",
        clearProps,
        scrollTrigger: {
          trigger: ctaSection,
          start: "top 82%",
          once: true,
        },
      }),
    );
  }
});

onBeforeUnmount(() => {
  for (const animation of [...activeAnimations].reverse()) {
    animation.revert();
    animation.kill?.();
  }

  activeAnimations = [];
});
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
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
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

.showcase-streak-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.showcase-streak-hero {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.showcase-streak-fire {
  font-size: var(--text-2xl);
}

.showcase-streak-detail {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: auto;
}

.showcase-card--ring {
  align-items: center;
}

.showcase-card--ring .showcase-card__eyebrow {
  align-self: flex-start;
}

.showcase-ring-wrap {
  position: relative;
  display: grid;
  place-items: center;
}

.showcase-ring__label {
  position: absolute;
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
}

.showcase-card--ring .showcase-ring__caption {
  margin-top: auto;
}

.showcase-ring__caption {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  text-align: center;
}

.showcase-heatmap {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.2rem;
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

/* ── Showcase Hours enrichment ──────────────────── */

.showcase-hours-bars {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-2);
  border-top: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
}

.showcase-hours-bar {
  display: grid;
  grid-template-columns: 5rem 1fr auto;
  align-items: center;
  gap: var(--space-2);
}

.showcase-hours-bar__name {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.showcase-hours-bar__track {
  height: 0.375rem;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-border) 40%, transparent);
  overflow: hidden;
}

.showcase-hours-bar__fill {
  height: 100%;
  border-radius: var(--radius-full);
}

.showcase-hours-bar__fill--spanish {
  width: 100%;
  background-color: #059669;
}

.showcase-hours-bar__fill--guitar {
  width: 72%;
  background-color: #8b5cf6;
}

.showcase-hours-bar__fill--typescript {
  width: 58%;
  background-color: #3178c6;
}

.showcase-hours-bar__val {
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  text-align: right;
  min-width: 2rem;
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

@media (max-width: 79.999rem) {
  .features__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 46rem;
    margin: 0 auto;
  }
}

@media (min-width: 64rem) and (max-width: 80rem) {
  .hero__inner {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.06fr);
    gap: var(--space-10);
  }

  .hero__content {
    max-width: 35rem;
  }

  .hero__subtitle {
    max-width: 42ch;
  }

  .hero__visual {
    display: flex;
    justify-content: flex-end;
  }

  .hero-showcase {
    width: min(100%, 35rem);
  }
}

@media (min-width: 58.001rem) and (max-width: 63.999rem) {
  .hero__inner {
    grid-template-columns: minmax(0, 0.94fr) minmax(0, 1.06fr);
    gap: var(--space-8);
    align-items: start;
  }

  .hero__content,
  .hero__visual {
    align-self: start;
  }

  .hero__content {
    max-width: 33rem;
  }

  .hero__subtitle {
    max-width: 37ch;
  }

  .hero__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
  }

  .hero__actions .btn {
    width: 100%;
    justify-content: center;
  }

  .hero__visual {
    display: flex;
    justify-content: flex-end;
  }

  .hero-showcase {
    width: min(100%, 32rem);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
    align-items: stretch;
  }

  .showcase-card--streak,
  .showcase-card--heatmap {
    grid-column: 1 / -1;
  }

  .showcase-card--streak {
    min-height: 10.5rem;
  }

  .showcase-card--hours {
    grid-column: 1;
    grid-row: 2;
    min-height: 12.5rem;
  }

  .showcase-card--ring {
    grid-column: 2;
    grid-row: 2;
    min-height: 12.5rem;
  }

  .showcase-card--heatmap {
    min-height: 11rem;
  }

  .showcase-card--ring .showcase-ring {
    width: 112px;
    height: 112px;
  }

  .features__grid {
    grid-auto-rows: 1fr;
    align-items: stretch;
    max-width: 48rem;
    margin: 0 auto;
  }

  .feature-card {
    height: 100%;
  }
}

@media (min-width: 48rem) and (max-width: 58rem) {
  .hero__inner {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }

  .hero__content {
    width: min(100%, 36rem);
    max-width: 36rem;
    margin: 0 auto;
    justify-self: center;
  }

  .hero__subtitle {
    max-width: 40ch;
  }

  .hero__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
  }

  .hero__actions .btn {
    width: 100%;
    justify-content: center;
  }

  .hero__visual {
    justify-self: center;
    width: 100%;
  }

  .hero-showcase {
    width: min(100%, 32rem);
    margin: 0 auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);
    align-items: stretch;
  }

  .showcase-card--streak,
  .showcase-card--heatmap {
    grid-column: 1 / -1;
  }

  .showcase-card--streak {
    min-height: 10.5rem;
  }

  .showcase-card--hours {
    grid-column: 1;
    grid-row: 2;
    min-height: 12.5rem;
  }

  .showcase-card--ring {
    grid-column: 2;
    grid-row: 2;
    min-height: 12.5rem;
  }

  .showcase-card--heatmap {
    min-height: 11rem;
  }

  .showcase-card--ring .showcase-ring {
    width: 112px;
    height: 112px;
  }
}

@media (max-width: 47.999rem) {
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
  .features__grid {
    grid-template-columns: 1fr;
    max-width: none;
  }

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
