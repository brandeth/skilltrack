<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number;
    max?: number;
    size?: number;
    stroke?: number;
    color?: string;
    label: string;
    caption?: string;
  }>(),
  {
    max: 100,
    size: 132,
    stroke: 10,
    color: "var(--color-progress)",
    caption: "",
  },
);

useCssVars(() => ({
  "ring-size": `${props.size}px`,
  "ring-color": props.color,
}));

const clampedRatio = computed(() => {
  if (!props.max || props.max <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, props.value / props.max));
});

const radius = computed(() => (props.size - props.stroke) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const animatedOffset = ref(0);

const targetOffset = computed(
  () => circumference.value * (1 - clampedRatio.value),
);

onMounted(() => {
  // Start from empty (full offset = empty ring)
  animatedOffset.value = circumference.value;
  // Animate to target on next frame
  requestAnimationFrame(() => {
    animatedOffset.value = targetOffset.value;
  });
});

// Update when value changes (not just on mount)
watch(targetOffset, (val) => {
  animatedOffset.value = val;
});

const normalizedValue = computed(() => Math.round(clampedRatio.value * 100));
</script>

<template>
  <div class="progress-ring" role="img" :aria-label="label">
    <svg
      class="progress-ring__svg"
      :width="size"
      :height="size"
      viewBox="0 0 132 132"
      aria-hidden="true"
    >
      <circle
        class="progress-ring__track"
        cx="66"
        cy="66"
        :r="radius"
        fill="none"
        :stroke-width="stroke"
      />
      <circle
        class="progress-ring__value"
        cx="66"
        cy="66"
        :r="radius"
        fill="none"
        :stroke-width="stroke"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="animatedOffset"
      />
    </svg>
    <div class="progress-ring__content">
      <div class="progress-ring__value-label">{{ normalizedValue }}%</div>
      <div v-if="caption" class="progress-ring__caption">{{ caption }}</div>
    </div>
  </div>
</template>
