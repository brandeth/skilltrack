# Nuxt and Vue Component Template

Use this pattern when the repo is Nuxt or Vue and the animation belongs to a single page or component.

```vue
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const root = ref<HTMLElement | null>(null);

let timeline: gsap.core.Timeline | null = null;

onMounted(async () => {
  await nextTick();

  if (!root.value) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const q = gsap.utils.selector(root.value);

  timeline = gsap.timeline();

  timeline
    .from(q(".hero-eyebrow"), {
      y: 20,
      autoAlpha: 0,
      duration: 0.45,
      ease: "power2.out",
    })
    .from(
      q(".hero-title"),
      {
        y: 28,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power3.out",
      },
      "-=0.2",
    )
    .from(
      q(".hero-subtitle, .hero-actions > *"),
      {
        y: 18,
        autoAlpha: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out",
      },
      "-=0.15",
    );
});

onBeforeUnmount(() => {
  timeline?.revert();
  timeline = null;
});
</script>

<template>
  <section ref="root">
    <div class="hero-eyebrow">For learners who show up</div>
    <h1 class="hero-title">See every hour you've invested.</h1>
    <p class="hero-subtitle">Track skills without losing momentum.</p>
    <div class="hero-actions">
      <button>Start free</button>
      <button>Try as guest</button>
    </div>
  </section>
</template>
```

## Notes

- Keep DOM reads and GSAP setup inside `onMounted()`.
- Use `nextTick()` if the template depends on client-side conditions before the target elements exist.
- Register `ScrollTrigger` only when scroll behavior is required.
- If the animation needs scroll reveal, attach `scrollTrigger` to a tween or timeline and refresh after major layout changes.
- If the same pattern will be reused, move the setup into a composable such as `app/composables/useHeroReveal.ts` and keep selectors local to the caller.