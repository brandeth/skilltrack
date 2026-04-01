<script setup lang="ts">
const { mode, toggle } = useColorMode();

const label = computed(() => {
  if (mode.value === "light") return "Switch to dark mode";
  if (mode.value === "dark") return "Switch to system mode";
  return "Switch to light mode";
});

const icon = computed(() => {
  if (mode.value === "light") return "☀️";
  if (mode.value === "dark") return "🌙";
  return "💻";
});
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="label"
    :title="label"
    @click="toggle"
  >
    <span aria-hidden="true">{{ icon }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-surface) 78%, transparent);
  font-size: 1.1rem;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease;
}

.theme-toggle:hover {
  transform: translateY(-1px);
  border-color: var(--color-accent);
}
</style>
