# Official GSAP Rules

Use these official documentation notes as the source of truth when applying the skill.

## Core APIs

- `gsap.to()` animates current values to new values.
- `gsap.from()` animates from declared starting values to current values.
- `gsap.fromTo()` is for explicit start and end values.
- `gsap.timeline()` is the preferred way to sequence multiple steps instead of stacking manual delays.

Official docs:
- https://gsap.com/docs/v3/GSAP/gsap/
- https://gsap.com/docs/v3/GSAP/Timeline/to()/
- https://gsap.com/docs/v3/GSAP/Timeline/from()/
- https://gsap.com/docs/v3/GSAP/Timeline/fromTo()/

## Plugin Registration

- Register plugins before using them.
- Example from the official docs:

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

Official docs:
- https://gsap.com/docs/v3/Plugins/
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/

## ScrollTrigger

- A tween or timeline can own a `scrollTrigger` configuration.
- When a tween or timeline has `scrollTrigger`, the created trigger is available on `.scrollTrigger`.
- Refresh after layout changes with `ScrollTrigger.refresh()` or `timeline.scrollTrigger.refresh()`.
- Use `gsap.matchMedia()` for responsive animation variants.
- `ScrollTrigger.matchMedia()` is deprecated.

Official docs:
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- https://gsap.com/docs/v3/GSAP/Timeline/scrollTrigger/
- https://gsap.com/docs/v3/GSAP/Tween/scrollTrigger/
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/refresh()/

## Scoped Selection

- Use `gsap.utils.selector(root)` to limit descendant selection to a container or component root.
- Use `gsap.utils.toArray(selector, root)` to collect scoped arrays of targets.

Official docs:
- https://gsap.com/docs/v3/GSAP/UtilityMethods/selector()/
- https://gsap.com/docs/v3/GSAP/UtilityMethods/toArray()/

## Cleanup

- `revert()` on tweens and timelines removes inline styles added by the animation and kills it.
- `ScrollTrigger.kill()` removes a trigger instance.
- Revert any `gsap.matchMedia()` instance when tearing down responsive animation state.

Official docs:
- https://gsap.com/docs/v3/GSAP/Tween/revert()/
- https://gsap.com/docs/v3/GSAP/Timeline/revert()/
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/

## Optional Cleanup Helpers

- `clearProps` can remove inline styles after a tween completes if CSS should take back control.
- Use it intentionally rather than by default.

Official docs:
- https://gsap.com/docs/v3/GSAP/CorePlugins/CSS/