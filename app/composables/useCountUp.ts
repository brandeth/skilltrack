export function useCountUp(
  target: Ref<number> | ComputedRef<number>,
  duration = 800,
) {
  const display = ref(0);
  let raf = 0;

  function animate(from: number, to: number) {
    cancelAnimationFrame(raf);
    const start = performance.now();

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      display.value = from + (to - from) * eased;

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        display.value = to;
      }
    }

    raf = requestAnimationFrame(step);
  }

  if (import.meta.client) {
    onMounted(() => {
      animate(0, toValue(target));
    });

    watch(target, (newVal, oldVal) => {
      animate(oldVal ?? 0, newVal);
    });

    onUnmounted(() => {
      cancelAnimationFrame(raf);
    });
  }

  return display;
}
