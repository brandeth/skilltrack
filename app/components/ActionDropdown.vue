<script setup lang="ts">
const emit = defineEmits<{
  select: [action: "session" | "skill"];
}>();

const isOpen = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const focusedIndex = ref(-1);

const items = [
  {
    value: "session" as const,
    label: "Log Session",
    sublabel: "Quick action",
  },
  {
    value: "skill" as const,
    label: "Create Skill",
    sublabel: "Recovery path",
  },
];

function toggle() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    focusedIndex.value = 0;
    nextTick(() => focusMenuItem(0));
  }
}

function close() {
  isOpen.value = false;
  focusedIndex.value = -1;
  triggerRef.value?.focus();
}

function selectItem(value: "session" | "skill") {
  emit("select", value);
  close();
}

function focusMenuItem(index: number) {
  const menuItems =
    menuRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]');
  menuItems?.[index]?.focus();
}

function onMenuKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    focusedIndex.value = (focusedIndex.value + 1) % items.length;
    focusMenuItem(focusedIndex.value);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    focusedIndex.value = (focusedIndex.value - 1 + items.length) % items.length;
    focusMenuItem(focusedIndex.value);
  } else if (e.key === "Escape") {
    close();
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    if (focusedIndex.value >= 0) {
      selectItem(items[focusedIndex.value]!.value);
    }
  }
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as Node;
  if (!triggerRef.value?.contains(target) && !menuRef.value?.contains(target)) {
    isOpen.value = false;
    focusedIndex.value = -1;
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<template>
  <div class="action-dropdown">
    <button
      ref="triggerRef"
      class="action-trigger"
      type="button"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      aria-label="New action"
      @click="toggle"
    >
      <span class="action-trigger__icon" aria-hidden="true">+</span>
      <span class="action-trigger__label">New</span>
      <svg
        class="action-trigger__chevron"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        aria-hidden="true"
      >
        <path
          d="M3 4.5L6 7.5L9 4.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div
      v-if="isOpen"
      ref="menuRef"
      class="action-menu"
      role="menu"
      @keydown="onMenuKeydown"
    >
      <button
        v-for="item in items"
        :key="item.value"
        class="action-menu__item"
        role="menuitem"
        tabindex="-1"
        @click="selectItem(item.value)"
      >
        <span class="action-menu__item-label">{{ item.label }}</span>
        <span class="action-menu__item-sublabel">{{ item.sublabel }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.action-dropdown {
  position: relative;
}

.action-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 2.5rem;
  padding: 0 var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: white;
  font-weight: var(--font-medium);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: background-color 120ms ease;
}

.action-trigger:hover {
  background: var(--color-accent-hover);
}

.action-trigger__icon {
  font-size: 1.2rem;
  line-height: 1;
}

.action-trigger__chevron {
  transition: transform 160ms ease;
}

.action-trigger[aria-expanded="true"] .action-trigger__chevron {
  transform: rotate(180deg);
}

.action-menu {
  display: grid;
  gap: var(--space-1);
  position: absolute;
  right: 0;
  top: calc(100% + var(--space-2));
  width: min(14rem, calc(100vw - 2rem));
  padding: var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  z-index: 30;
}

.action-menu__item {
  display: grid;
  gap: 0.125rem;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-primary);
  text-align: left;
  cursor: pointer;
  transition: background-color 100ms ease;
}

.action-menu__item:hover,
.action-menu__item:focus {
  background: var(--color-bg-tertiary);
  outline: none;
}

.action-menu__item-label {
  font-weight: var(--font-medium);
}

.action-menu__item-sublabel {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

@media (max-width: 52rem) {
  .action-trigger__label,
  .action-trigger__chevron {
    display: none;
  }

  .action-trigger {
    padding: 0 var(--space-3);
    min-width: 2.5rem;
    justify-content: center;
  }
}
</style>
