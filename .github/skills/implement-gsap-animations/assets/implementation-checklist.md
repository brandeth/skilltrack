# GSAP Implementation Checklist

## Preflight

- Detect the stack from `package.json` and app entry points.
- Identify the smallest surface that owns the requested motion.
- Confirm whether `gsap` is already installed.
- Decide whether the task needs no plugin, `ScrollTrigger`, or another explicitly requested plugin.
- Explain where the code should live before editing files.

## Coding Rules

- Use official GSAP APIs only.
- Prefer local component selectors over global document selectors.
- Use timelines for sequenced sections.
- Keep properties on transforms and opacity whenever possible.
- Keep SSR-safe code client-only in server-rendered frameworks.
- Add teardown with `revert()` or `kill()`.

## ScrollTrigger Checks

- Only register `ScrollTrigger` if the animation depends on scroll.
- Start with a minimal trigger config.
- Use `gsap.matchMedia()` for responsive changes.
- Refresh triggers after dynamic layout changes.

## Accessibility and UX Checks

- Critical content stays readable.
- Motion does not block interaction or reorder meaning.
- Reduced-motion behavior is considered.
- Debug markers are removed from production code.

## Final Summary Must Include

- Files changed.
- What animation was added.
- How to tune duration.
- How to tune easing.
- How to tune delay and stagger.
- How to tune trigger start or end points.