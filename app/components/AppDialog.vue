<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  title: string;
  eyebrow?: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const dialogRef = ref<HTMLElement | null>(null);
const previousActiveElement = ref<HTMLElement | null>(null);
const titleId = useId();

function close() {
  emit("update:open", false);
}

function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    close();
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    close();
    return;
  }
  if (e.key === "Tab") {
    trapFocus(e);
  }
}

function getFocusableElements(): HTMLElement[] {
  if (!dialogRef.value) return [];
  return Array.from(
    dialogRef.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function trapFocus(e: KeyboardEvent) {
  const focusable = getFocusableElements();
  if (!focusable.length) return;

  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) return;

    if (isOpen) {
      previousActiveElement.value =
        document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      nextTick(() => {
        const focusable = getFocusableElements();
        if (focusable.length) {
          focusable[0]!.focus();
        }
      });
    } else {
      document.body.style.overflow = "";
      nextTick(() => {
        previousActiveElement.value?.focus();
        previousActiveElement.value = null;
      });
    }
  },
);

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = "";
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="open"
        class="dialog-overlay"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <div
          ref="dialogRef"
          class="dialog-container"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <div class="dialog__header">
            <div>
              <div v-if="eyebrow" class="panel__eyebrow">{{ eyebrow }}</div>
              <h2 :id="titleId" class="dialog__title">{{ title }}</h2>
            </div>
            <button
              class="dialog__close"
              type="button"
              aria-label="Close dialog"
              @click="close"
            >
              &#215;
            </button>
          </div>
          <div class="dialog__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="dialog__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  background: rgba(26, 29, 26, 0.45);
  backdrop-filter: blur(4px);
}

.dialog-container {
  position: relative;
  z-index: 50;
  width: min(32rem, calc(100vw - 2rem));
  max-height: min(85vh, 40rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6) var(--space-3);
}

.dialog__title {
  margin: 0.2rem 0 0;
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  line-height: var(--leading-normal);
}

.dialog__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  flex: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.dialog__close:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.dialog__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-3) var(--space-6) var(--space-6);
}

.dialog__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6) var(--space-6);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.dialog-enter-active .dialog-container {
  animation: dialog-in 200ms ease-out;
}

.dialog-leave-active .dialog-container {
  animation: dialog-in 150ms ease-in reverse;
}

.dialog-enter-active {
  animation: overlay-in 200ms ease-out;
}

.dialog-leave-active {
  animation: overlay-in 150ms ease-in reverse;
}

@keyframes dialog-in {
  from {
    transform: translateY(1rem) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 52rem) {
  .dialog-overlay {
    place-items: end stretch;
  }

  .dialog-container {
    width: 100%;
    max-height: 85vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dialog-enter-active,
  .dialog-leave-active,
  .dialog-enter-active .dialog-container,
  .dialog-leave-active .dialog-container {
    animation: none;
  }
}
</style>
