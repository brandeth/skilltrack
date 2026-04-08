---
name: implement-gsap-animations
description: "Implement production-ready GSAP animations using official GSAP documentation. Use when adding entrance or reveal motion, staggered text or cards, hero timelines, ScrollTrigger animations, or framework-aware GSAP integrations in Nuxt, Vue, React, Next, or vanilla JavaScript."
argument-hint: "Describe the target UI, desired motion, whether it is scroll-based, and any SSR or framework constraints."
user-invocable: true
---

# Implement GSAP Animations

Use this skill to add production-ready GSAP motion without guessing APIs or scattering animation code through the app. Treat the official GSAP docs as the source of truth and adapt the implementation to the detected stack before editing files.

Primary references:
- [official GSAP rules](./references/official-gsap-docs.md)
- [implementation checklist](./assets/implementation-checklist.md)
- [Nuxt and Vue component template](./assets/nuxt-vue-component-template.md)

## When to Use

- Add a hero entrance sequence with `gsap.timeline()`.
- Reveal text, cards, or UI groups with `gsap.from()`, `gsap.to()`, or `gsap.fromTo()`.
- Add scroll-based motion with `ScrollTrigger`.
- Integrate GSAP into Nuxt, Vue, React, Next, or vanilla JS without breaking SSR or cleanup.
- Refactor ad hoc animation code into reusable helpers, composables, or utilities.

## What This Skill Must Produce

Before coding, inspect the project and summarize all four items:
1. Detected framework or runtime.
2. Likely entry points or components for the animation.
3. Whether `gsap` is already installed.
4. Which plugins are actually required.

Then:
1. Propose the smallest clean implementation plan.
2. Explain where the code should live before changing files.
3. Implement the animation.
4. Summarize the result with files changed, what motion was added, and how to tweak duration, easing, delay, stagger, and trigger points.

## Project Inspection Workflow

1. Detect the stack from files and dependencies before writing code.
   - Check `package.json` for `nuxt`, `vue`, `react`, `next`, `vite`, or plain frontend tooling.
   - Check app entry points like `app.vue`, `pages/`, `components/`, `src/main.*`, `nuxt.config.*`, `next.config.*`, or route files.
   - Search for existing animation helpers, composables, or motion conventions before creating new ones.
2. Confirm whether `gsap` is already installed.
   - If missing, add only `gsap` unless the task explicitly requires something else.
   - Do not add wrapper libraries unless the repo already uses them or the user asks for them.
3. Decide the implementation surface.
   - Component-local animation belongs beside the component or page.
   - Reusable motion belongs in a helper or composable.
   - In this repo, prefer `app/composables/` for reusable behavior and keep component-specific selectors in the owning `.vue` file.
4. Choose the lightest viable GSAP feature set.
   - Single reveal: `gsap.from()` or `gsap.to()`.
   - Explicit start and end states: `gsap.fromTo()`.
   - Sequenced choreography: `gsap.timeline()`.
   - Scroll-linked or viewport-triggered motion: `ScrollTrigger`.
5. Explain the placement and plan before editing.

## GSAP Implementation Rules

- Use only official GSAP APIs and terminology from the official docs.
- Prefer `gsap.to()`, `gsap.from()`, `gsap.fromTo()`, and `gsap.timeline()` for most UI motion.
- Use timelines for multi-step hero, onboarding, or composite animations instead of stacking arbitrary delays.
- Scope selectors to a component or container instead of using broad global selectors.
- Use `gsap.utils.selector(root)` or `gsap.utils.toArray(selector, root)` when targeting descendants inside a specific container.
- Favor `transform` and `opacity` driven motion. Avoid animating layout-affecting properties unless the behavior truly requires it.
- Keep motion unobtrusive. Do not break reading order, focus order, or interaction timing.
- Do not hide critical content in a way that makes the page unusable if JavaScript is late or disabled.
- Use advanced plugins only when the requested motion actually needs them.
- Do not add smooth-scroll tooling, ScrollSmoother, Flip, MorphSVG, or other advanced plugins unless explicitly requested and justified by the task.

## Framework-Specific Notes

### Vanilla JS

- Wait until the DOM is available before reading elements or creating animations.
- Keep shared animation helpers in a dedicated utility file if more than one surface uses them.
- Store tween or timeline references so cleanup is possible when the page swaps or re-renders.

### Vue and Nuxt

- Never touch `window`, `document`, or DOM nodes during SSR.
- Run DOM animation setup in `onMounted()`, optionally after `nextTick()` when the DOM shape depends on conditional rendering.
- If a helper can be imported in both server and client code paths, guard DOM work with `import.meta.client`.
- For repeated patterns, prefer a composable in `app/composables/` or a small utility under the app layer instead of duplicating setup across components.
- Scope selectors to the component root and clean up with stored tween or timeline references using `revert()` on unmount.
- Use `.client` plugins only when there is a strong reason to centralize setup. Do not move simple component-local animations into global Nuxt plugins.

### React and Next

- Use refs for the animation root.
- In client components, initialize animations after mount with `useLayoutEffect` or the existing repo pattern.
- Return cleanup that reverts or kills the animation objects you created.
- In Next, keep DOM animation code in client components and avoid importing browser-only helpers into server components.

## Plugin Registration Rules

- Register plugins only when they are used.
- Register plugins with `gsap.registerPlugin(...)` before using plugin-specific features.
- Typical pattern:

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

- Register only the plugins required by the current task.
- Do not invent plugin imports or registrations.
- If a plugin is not needed, do not import it.

## ScrollTrigger Guidance

- Use `ScrollTrigger` only for scroll-based requirements.
- Prefer element-specific triggers over page-wide triggers.
- Start with the smallest configuration that matches the behavior:
  - `trigger`
  - `start`
  - `end` only when needed
  - `once`, `toggleActions`, or `scrub` depending on the requested interaction
- Use a timeline with `scrollTrigger` when the section contains multiple coordinated steps.
- Use `gsap.matchMedia()` for responsive variants. Do not use deprecated `ScrollTrigger.matchMedia()` in new code.
- If layout changes after mount, refresh triggers with `ScrollTrigger.refresh()` or `timeline.scrollTrigger?.refresh()`.
- If the task requests smooth scrolling or scroller proxies, stop and confirm that the extra complexity is actually wanted.

## Cleanup and Performance Checklist

- Revert every tween or timeline you create when the framework lifecycle requires teardown.
- Kill explicit `ScrollTrigger` instances you own if they are not cleaned up by reverting the parent animation.
- Revert any `gsap.matchMedia()` instance you create.
- Scope selectors so one component cannot accidentally animate another.
- Prefer `x`, `y`, `scale`, `rotation`, `autoAlpha`, and opacity-driven transitions over layout-changing properties.
- Use `clearProps` only when you need the animation to remove inline styles after it completes.
- Respect reduced motion. If the surface is content-heavy or essential, simplify or skip the effect when motion should be minimized.
- Avoid markers, debug flags, and development-only instrumentation in final code.

## Definition of Done

The task is done only when all of the following are true:

- The detected stack, likely entry points, GSAP install state, and required plugins were summarized before implementation.
- Code placement was explained before files changed.
- The implementation uses official GSAP APIs only.
- Only the required plugins were imported and registered.
- The solution is SSR-safe for Nuxt, Next, or any other server-rendered stack.
- Cleanup was added where the framework lifecycle requires it.
- The implementation preserves the project's file structure, coding conventions, and styling approach.
- The final summary includes files changed, animation behavior, and the tuning knobs for duration, easing, delay, stagger, and scroll trigger points.

## Example Workflows

### Animate a Hero Section

1. Inspect the page component that owns the hero and identify a single root container.
2. Use a component-local timeline for the hero content.
3. Sequence eyebrow, heading, copy, actions, and decorative media with `gsap.timeline()`.
4. Use `from()` or `fromTo()` for initial reveal values and keep the motion mostly on transforms and opacity.
5. Store the timeline and `revert()` it on teardown.

Suggested defaults:
- heading and copy: `y` plus opacity
- grouped actions: small upward offset and short stagger
- decorative visuals: subtle scale or translate, not large layout shifts

### Animate Cards on Scroll

1. Collect the cards from the nearest section root, not from the whole document.
2. Register `ScrollTrigger` only if it is actually needed.
3. Use either one staggered tween tied to the section or per-card triggers depending on the design.
4. Start with a simple trigger such as `start: "top 80%"` and avoid over-configuring unless the design requires it.
5. Refresh triggers if card heights or layout change after async content loads.

### Animate Text with Stagger

1. Confirm whether the text is already split into spans or words in the markup.
2. If not, add the minimum safe markup necessary without breaking semantics or accessibility.
3. Target only the text fragments inside the local root.
4. Use a short stagger and restrained distance values.
5. If the text is essential content, keep the initial state readable and reduce motion when appropriate.

### Integrate GSAP into a Nuxt or Vue Component Cleanly

1. Keep the animation local if it only affects one page or component.
2. Use `onMounted()` and `nextTick()` to ensure the DOM exists before querying descendants.
3. Scope descendant lookups with `gsap.utils.selector(root)`.
4. Store the created timeline, tween, trigger, or matchMedia instance.
5. Clean up with `revert()` or `kill()` inside `onBeforeUnmount()`.

Use [Nuxt and Vue component template](./assets/nuxt-vue-component-template.md) as the default pattern.

## Response Shape for This Skill

When using this skill, structure the work in this order:
1. Inspection summary.
2. Smallest clean implementation plan.
3. Code placement decision.
4. Implementation.
5. Final summary with changed files and tuning instructions.