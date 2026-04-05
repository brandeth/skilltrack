<script setup lang="ts">
const areaRef = ref<HTMLElement | null>(null);
const orbPos = reactive({ x: 0, y: 0 });
const orbTarget = reactive({ x: 0, y: 0 });
const orbGoal = reactive({ x: 0, y: 0 });
const orbVel = reactive({ x: 0, y: 0 });
const orbHovered = ref(false);
const orbPulsing = ref(false);
let orbRaf = 0;
let prevX = 0;
let prevY = 0;
const ORB_HALF = 64; // half of 8rem (128px)
const orbTransform = computed(() => `translate(${orbPos.x}px, ${orbPos.y}px)`);

useCssVars(() => ({
  "skill-card-orb-transform": orbTransform.value,
}));

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function pickWanderGoal() {
  const el = areaRef.value;
  if (!el) return;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  orbGoal.x = Math.random() * w - ORB_HALF;
  orbGoal.y = Math.random() * h - ORB_HALF;
}

function pickWanderGoalFromHeading() {
  const el = areaRef.value;
  if (!el) return;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const speed = Math.sqrt(orbVel.x ** 2 + orbVel.y ** 2);
  const drift = 150 + Math.random() * 100;
  if (speed > 0.05) {
    const nx = orbVel.x / speed;
    const ny = orbVel.y / speed;
    const spread = (Math.random() - 0.5) * 1.2;
    const cos = Math.cos(spread);
    const sin = Math.sin(spread);
    const dx = nx * cos - ny * sin;
    const dy = nx * sin + ny * cos;
    orbGoal.x = clamp(orbPos.x + dx * drift, -ORB_HALF, w - ORB_HALF);
    orbGoal.y = clamp(orbPos.y + dy * drift, -ORB_HALF, h - ORB_HALF);
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

function onEnter() {
  clearTimeout(orbLeaveTimeout);
  orbHovered.value = true;
}

function onMove(e: MouseEvent) {
  const el = areaRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  orbGoal.x = e.clientX - rect.left - ORB_HALF;
  orbGoal.y = e.clientY - rect.top - ORB_HALF;
}

function onLeave() {
  orbLeaveTimeout = window.setTimeout(() => {
    orbHovered.value = false;
    pickWanderGoalFromHeading();
  }, 800);
}

function onOrbClick() {
  orbPulsing.value = false;
  void nextTick(() => {
    orbPulsing.value = true;
  });
}

let parentEl: HTMLElement | null = null;

onMounted(() => {
  const el = areaRef.value;
  if (el) {
    orbPos.x = el.offsetWidth / 2 - ORB_HALF;
    orbPos.y = el.offsetHeight - ORB_HALF;
    orbTarget.x = orbPos.x;
    orbTarget.y = orbPos.y;
    prevX = orbPos.x;
    prevY = orbPos.y;
    pickWanderGoal();

    parentEl = el.parentElement;
    if (parentEl) {
      parentEl.addEventListener("mouseenter", onEnter);
      parentEl.addEventListener("mousemove", onMove);
      parentEl.addEventListener("mouseleave", onLeave);
    }
  }
  orbRaf = requestAnimationFrame(orbLoop);
});

onUnmounted(() => {
  cancelAnimationFrame(orbRaf);
  clearTimeout(orbLeaveTimeout);
  if (parentEl) {
    parentEl.removeEventListener("mouseenter", onEnter);
    parentEl.removeEventListener("mousemove", onMove);
    parentEl.removeEventListener("mouseleave", onLeave);
  }
});
</script>

<template>
  <div ref="areaRef" class="skill-card__orb-area" aria-hidden="true">
    <div
      :class="['skill-card__orb', { 'skill-card__orb--pulse': orbPulsing }]"
      @click="onOrbClick"
      @animationend="orbPulsing = false"
    />
  </div>
</template>
