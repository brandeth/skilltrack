<script setup lang="ts">
import type { CSSProperties } from "vue";

interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: SelectOption[];
    label: string;
    inputId?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
  }>(),
  {
    inputId: undefined,
    placeholder: "Select an option",
    disabled: false,
    required: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const listboxRef = ref<HTMLElement | null>(null);
const optionRefs = ref<Array<HTMLElement | undefined>>([]);
const isOpen = ref(false);
const activeIndex = ref(-1);
const fallbackId = useId();
const typeaheadBuffer = ref("");
const menuStyle = ref<CSSProperties>({});
let typeaheadTimeout: ReturnType<typeof setTimeout> | null = null;
let positionRaf: number | null = null;

const MENU_OFFSET = 8;
const VIEWPORT_PADDING = 12;

const baseId = computed(() => props.inputId || fallbackId);
const labelId = computed(() => `${baseId.value}-label`);
const triggerId = computed(() => `${baseId.value}-trigger`);
const valueId = computed(() => `${baseId.value}-value`);
const listboxId = computed(() => `${baseId.value}-listbox`);

const selectedIndex = computed(() =>
  props.options.findIndex((option) => option.value === props.modelValue),
);

const selectedOption = computed(() =>
  selectedIndex.value >= 0 ? props.options[selectedIndex.value] : null,
);

const activeDescendantId = computed(() =>
  isOpen.value && activeIndex.value >= 0
    ? getOptionId(activeIndex.value)
    : undefined,
);

watch(
  [selectedIndex, () => props.options.length],
  ([index, optionCount]) => {
    if (isOpen.value) {
      if (activeIndex.value >= optionCount) {
        activeIndex.value = optionCount ? optionCount - 1 : -1;
      }
      return;
    }

    activeIndex.value = index >= 0 ? index : optionCount ? 0 : -1;
  },
  { immediate: true },
);

watch([isOpen, activeIndex], ([open, index]) => {
  if (!open || index < 0) {
    return;
  }

  nextTick(() => {
    ensureOptionVisible(index);
  });
});

watch(isOpen, (open) => {
  if (!import.meta.client) {
    return;
  }

  if (open) {
    window.addEventListener("resize", scheduleMenuPositionUpdate);
    document.addEventListener("scroll", scheduleMenuPositionUpdate, true);

    nextTick(() => {
      updateMenuPosition();
      listboxRef.value?.focus({ preventScroll: true });
    });

    return;
  }

  window.removeEventListener("resize", scheduleMenuPositionUpdate);
  document.removeEventListener("scroll", scheduleMenuPositionUpdate, true);

  if (positionRaf !== null) {
    window.cancelAnimationFrame(positionRaf);
    positionRaf = null;
  }
});

function getOptionId(index: number) {
  return `${baseId.value}-option-${index}`;
}

function isTargetInsideSelect(target: Node | null) {
  if (!target) {
    return false;
  }

  return Boolean(
    rootRef.value?.contains(target) || listboxRef.value?.contains(target),
  );
}

function updateMenuPosition() {
  if (!import.meta.client || !isOpen.value || !triggerRef.value) {
    return;
  }

  const rect = triggerRef.value.getBoundingClientRect();
  const preferredMaxHeight = Math.min(275, window.innerHeight * 0.4);
  const availableBelow = Math.max(
    window.innerHeight - rect.bottom - MENU_OFFSET - VIEWPORT_PADDING,
    0,
  );
  const availableAbove = Math.max(rect.top - MENU_OFFSET - VIEWPORT_PADDING, 0);
  const placeBelow =
    availableBelow >= preferredMaxHeight || availableBelow >= availableAbove;
  const availableHeight = placeBelow ? availableBelow : availableAbove;
  const maxHeight =
    availableHeight >= 80
      ? Math.min(preferredMaxHeight, availableHeight)
      : availableHeight;
  const width = Math.min(
    rect.width,
    Math.max(window.innerWidth - VIEWPORT_PADDING * 2, 0),
  );
  const left = Math.min(
    Math.max(rect.left, VIEWPORT_PADDING),
    Math.max(window.innerWidth - VIEWPORT_PADDING - width, VIEWPORT_PADDING),
  );

  menuStyle.value = {
    position: "fixed",
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: `${maxHeight}px`,
    top: placeBelow ? `${rect.bottom + MENU_OFFSET}px` : "auto",
    bottom: placeBelow
      ? "auto"
      : `${window.innerHeight - rect.top + MENU_OFFSET}px`,
  };
}

function scheduleMenuPositionUpdate() {
  if (!import.meta.client || !isOpen.value) {
    return;
  }

  if (positionRaf !== null) {
    window.cancelAnimationFrame(positionRaf);
  }

  positionRaf = window.requestAnimationFrame(() => {
    positionRaf = null;
    updateMenuPosition();
  });
}

function setOptionRef(el: Element | null, index: number) {
  if (el instanceof HTMLElement) {
    optionRefs.value[index] = el;
    return;
  }

  optionRefs.value[index] = undefined;
}

function ensureOptionVisible(index: number) {
  const listbox = listboxRef.value;
  const option = optionRefs.value[index];

  if (!listbox || !option) {
    return;
  }

  const optionTop = option.offsetTop;
  const optionBottom = optionTop + option.offsetHeight;
  const viewTop = listbox.scrollTop;
  const viewBottom = viewTop + listbox.clientHeight;

  if (optionTop < viewTop) {
    listbox.scrollTop = optionTop;
    return;
  }

  if (optionBottom > viewBottom) {
    listbox.scrollTop = optionBottom - listbox.clientHeight;
  }
}

function getInitialIndex(fallbackToLast = false) {
  if (!props.options.length) {
    return -1;
  }

  if (selectedIndex.value >= 0) {
    return selectedIndex.value;
  }

  return fallbackToLast ? props.options.length - 1 : 0;
}

function openListbox(preferredIndex = getInitialIndex()) {
  if (props.disabled || !props.options.length) {
    return;
  }

  activeIndex.value = preferredIndex;
  isOpen.value = true;
}

function closeListbox(options: { restoreFocus?: boolean } = {}) {
  if (!isOpen.value) {
    return;
  }

  isOpen.value = false;
  clearTypeahead();

  if (options.restoreFocus) {
    nextTick(() => {
      triggerRef.value?.focus({ preventScroll: true });
    });
  }
}

function toggleListbox() {
  if (isOpen.value) {
    closeListbox({ restoreFocus: true });
    return;
  }

  openListbox();
}

function setActiveIndex(index: number) {
  if (index < 0 || index >= props.options.length) {
    return;
  }

  activeIndex.value = index;
}

function moveActive(step: number) {
  if (!props.options.length) {
    return;
  }

  if (activeIndex.value < 0) {
    activeIndex.value = step > 0 ? 0 : props.options.length - 1;
    return;
  }

  activeIndex.value =
    (activeIndex.value + step + props.options.length) % props.options.length;
}

function selectOption(value: string) {
  emit("update:modelValue", value);
  closeListbox({ restoreFocus: true });
}

function selectActiveOption() {
  if (activeIndex.value < 0) {
    return;
  }

  const option = props.options[activeIndex.value];
  if (option) {
    selectOption(option.value);
  }
}

function clearTypeahead() {
  if (typeaheadTimeout) {
    clearTimeout(typeaheadTimeout);
    typeaheadTimeout = null;
  }

  typeaheadBuffer.value = "";
}

function queueTypeaheadReset() {
  if (typeaheadTimeout) {
    clearTimeout(typeaheadTimeout);
  }

  typeaheadTimeout = setTimeout(() => {
    typeaheadBuffer.value = "";
    typeaheadTimeout = null;
  }, 400);
}

function findMatch(query: string, startIndex: number) {
  if (!query || !props.options.length) {
    return -1;
  }

  for (let offset = 0; offset < props.options.length; offset += 1) {
    const index = (startIndex + offset) % props.options.length;
    const option = props.options[index];

    if (option?.label.toLowerCase().startsWith(query)) {
      return index;
    }
  }

  return -1;
}

function handleTypeahead(key: string) {
  if (
    props.disabled ||
    !props.options.length ||
    key.length !== 1 ||
    key === " "
  ) {
    return false;
  }

  const nextQuery = `${typeaheadBuffer.value}${key.toLowerCase()}`;
  const startIndex =
    activeIndex.value >= 0 ? (activeIndex.value + 1) % props.options.length : 0;

  let matchIndex = findMatch(nextQuery, startIndex);
  let resolvedQuery = nextQuery;

  if (matchIndex < 0 && nextQuery.length > 1) {
    resolvedQuery = key.toLowerCase();
    matchIndex = findMatch(resolvedQuery, startIndex);
  }

  typeaheadBuffer.value = resolvedQuery;
  queueTypeaheadReset();

  if (matchIndex < 0) {
    return false;
  }

  if (!isOpen.value) {
    openListbox(matchIndex);
    return true;
  }

  setActiveIndex(matchIndex);
  return true;
}

function onTriggerKeydown(e: KeyboardEvent) {
  if (props.disabled) {
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    e.stopPropagation();
    openListbox(getInitialIndex());
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    e.stopPropagation();
    openListbox(getInitialIndex(true));
    return;
  }

  if (e.key === "Home") {
    e.preventDefault();
    e.stopPropagation();
    openListbox(0);
    return;
  }

  if (e.key === "End") {
    e.preventDefault();
    e.stopPropagation();
    openListbox(props.options.length - 1);
    return;
  }

  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    e.stopPropagation();
    openListbox();
    return;
  }

  if (isOpen.value && e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    closeListbox({ restoreFocus: true });
    return;
  }

  if (handleTypeahead(e.key)) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function onListboxKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    e.stopPropagation();
    moveActive(1);
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    e.stopPropagation();
    moveActive(-1);
    return;
  }

  if (e.key === "Home") {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex(0);
    return;
  }

  if (e.key === "End") {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex(props.options.length - 1);
    return;
  }

  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    e.stopPropagation();
    selectActiveOption();
    return;
  }

  if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    closeListbox({ restoreFocus: true });
    return;
  }

  if (e.key === "Tab") {
    closeListbox();
    return;
  }

  if (handleTypeahead(e.key)) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function onFocusOut(e: FocusEvent) {
  const nextTarget = e.relatedTarget as Node | null;
  if (isTargetInsideSelect(nextTarget)) {
    return;
  }

  closeListbox();
}

function onPointerDown(e: PointerEvent) {
  const target = e.target as Node | null;
  if (isTargetInsideSelect(target)) {
    return;
  }

  closeListbox();
}

onMounted(() => {
  document.addEventListener("pointerdown", onPointerDown);
});

onUnmounted(() => {
  clearTypeahead();
  if (import.meta.client) {
    window.removeEventListener("resize", scheduleMenuPositionUpdate);
    document.removeEventListener("scroll", scheduleMenuPositionUpdate, true);

    if (positionRaf !== null) {
      window.cancelAnimationFrame(positionRaf);
      positionRaf = null;
    }
  }
  document.removeEventListener("pointerdown", onPointerDown);
});
</script>

<template>
  <div class="field">
    <label :id="labelId" :for="triggerId">{{ label }}</label>

    <div ref="rootRef" class="listbox-select" @focusout="onFocusOut">
      <button
        :id="triggerId"
        ref="triggerRef"
        class="listbox-select__trigger"
        type="button"
        :disabled="disabled"
        aria-haspopup="listbox"
        :aria-controls="listboxId"
        :aria-expanded="isOpen"
        :aria-labelledby="`${labelId} ${valueId}`"
        :aria-required="required"
        @click="toggleListbox"
        @keydown="onTriggerKeydown"
      >
        <span class="listbox-select__value-wrap">
          <span
            v-if="selectedOption?.color"
            class="listbox-select__swatch listbox-select__swatch--trigger"
            :style="{ '--select-swatch-color': selectedOption.color }"
            aria-hidden="true"
          />
          <span
            :id="valueId"
            :class="[
              'listbox-select__value',
              { 'listbox-select__value--placeholder': !selectedOption },
            ]"
          >
            {{ selectedOption?.label ?? placeholder }}
          </span>
        </span>

        <svg
          class="listbox-select__chevron"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          aria-hidden="true"
        >
          <path
            d="M3.5 5.5L7 9L10.5 5.5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        :id="listboxId"
        ref="listboxRef"
        class="listbox-select__menu"
        :style="menuStyle"
        role="listbox"
        tabindex="0"
        :aria-labelledby="labelId"
        :aria-required="required"
        :aria-activedescendant="activeDescendantId"
        @focusout="onFocusOut"
        @keydown="onListboxKeydown"
      >
        <div style="overflow-y: scroll; max-height: 256px">
          <div
            v-for="(option, index) in options"
            :id="getOptionId(index)"
            :key="option.value"
            :ref="(el) => setOptionRef(el, index)"
            :class="[
              'listbox-select__option',
              {
                'listbox-select__option--active': index === activeIndex,
                'listbox-select__option--selected': option.value === modelValue,
              },
            ]"
            role="option"
            :aria-selected="option.value === modelValue"
            @mouseenter="setActiveIndex(index)"
            @mousedown.prevent
            @click="selectOption(option.value)"
          >
            <span class="listbox-select__option-label">
              <span
                v-if="option.color"
                class="listbox-select__swatch"
                :style="{ '--select-swatch-color': option.color }"
                aria-hidden="true"
              />
              <span class="listbox-select__option-text">{{
                option.label
              }}</span>
            </span>

            <svg
              class="listbox-select__check"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              aria-hidden="true"
            >
              <path
                d="M2.5 7.2L5.5 10.2L11.5 4.2"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.listbox-select {
  position: relative;
  width: 100%;
  min-width: 0;
}

.listbox-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
  min-height: 2.9rem;
  padding: 0.8rem 0.95rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--color-surface) 72%, transparent),
    var(--shadow-sm);
  color: var(--color-text-primary);
  text-align: left;
}

.listbox-select__trigger:disabled {
  cursor: not-allowed;
  color: var(--color-text-tertiary);
  background: color-mix(
    in srgb,
    var(--color-bg-tertiary) 52%,
    var(--color-surface)
  );
  box-shadow: none;
}

.listbox-select__value-wrap,
.listbox-select__option-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.listbox-select__value,
.listbox-select__option-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.listbox-select__value--placeholder {
  color: var(--color-text-tertiary);
}

.listbox-select__swatch {
  width: 0.65rem;
  height: 0.65rem;
  flex: none;
  border-radius: var(--radius-full);
  background: var(--select-swatch-color);
  box-shadow: 0 0 0 1px
    color-mix(in srgb, var(--select-swatch-color) 32%, var(--color-surface));
}

.listbox-select__swatch--trigger {
  width: 0.75rem;
  height: 0.75rem;
}

.listbox-select__chevron {
  flex: none;
  color: var(--color-text-tertiary);
  transition: transform 160ms ease;
}

.listbox-select__trigger[aria-expanded="true"] .listbox-select__chevron {
  transform: rotate(180deg);
}

.listbox-select__menu {
  z-index: 60;
  display: grid;
  gap: var(--space-1);
  max-height: min(16rem, 40vh);
  padding: var(--space-2);
  /* overflow-y: auto; */
  border: 1px solid color-mix(in srgb, var(--color-border) 92%, transparent);
  border-radius: calc(var(--radius-lg) + 0.125rem);
  background: color-mix(in srgb, var(--color-surface) 96%, transparent);
  box-shadow: var(--shadow-lg);
}

.listbox-select__option {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  min-height: 2.75rem;
  padding: 0.7rem 0.85rem;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.listbox-select__option--active {
  background: color-mix(in srgb, var(--color-bg-tertiary) 78%, transparent);
}

.listbox-select__option--selected {
  background: var(--color-accent-subtle);
  color: var(--color-text-primary);
  font-weight: var(--font-semibold);
}

.listbox-select__option--active.listbox-select__option--selected {
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--color-accent) 24%, transparent);
}

.listbox-select__check {
  flex: none;
  color: var(--color-accent);
  opacity: 0;
  transition: opacity 120ms ease;
}

.listbox-select__option--selected .listbox-select__check {
  opacity: 1;
}
</style>
