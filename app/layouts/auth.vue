<template>
  <div class="auth-layout">
    <div class="auth-layout__inner">
      <div class="auth-layout__header">
        <NuxtLink
          to="/"
          class="auth-layout__brand"
          aria-label="SkillTrack home"
        >
          <span class="brand__mark" aria-hidden="true">S</span>
          <span class="brand__name">SkillTrack</span>
        </NuxtLink>
        <ThemeToggle />
      </div>
      <div id="auth-content" class="auth-card panel">
        <slot />
      </div>
      <p class="auth-layout__footer helper-text">
        Practice visibility for the long game.
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--space-4);
}

.auth-layout__inner {
  display: grid;
  gap: var(--space-6);
  justify-items: center;
  width: min(26rem, 100%);
}

.auth-layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.auth-layout__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: var(--color-text-primary);
}

.auth-layout__brand .brand__name {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
}

.auth-card {
  width: 100%;
  padding: var(--space-6);
}

.auth-layout__footer {
  text-align: center;
}
</style>
