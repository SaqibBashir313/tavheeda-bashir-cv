import { MOTION_PRESETS, type MotionPresetName, SCROLL, STAGGER } from '@/config/animation';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/** Transform-ish props GSAP should hand back to CSS once a reveal finishes. */
const CLEAR_AFTER_REVEAL = 'transform,filter,clipPath';

export interface PlayPresetOptions {
  targets: gsap.TweenTarget;
  preset: MotionPresetName;
  /** When true, jump straight to the end state — no motion at all. */
  reduced?: boolean;
  delay?: number;
  stagger?: number;
  duration?: number;
  ease?: string;
  scrollTrigger?: ScrollTrigger.Vars;
  /** Append to an existing timeline instead of creating a standalone tween. */
  timeline?: gsap.core.Timeline;
  position?: gsap.Position;
  onComplete?: () => void;
}

/**
 * THE preset runner. `<Reveal>`, `<StaggerGroup>`, `<AnimatedText>`,
 * `<RouteTransition>` and every feature section funnel through this function.
 *
 * Centralising it means reduced-motion handling, `clearProps` cleanup and
 * ScrollTrigger wiring are implemented once instead of in a dozen effects.
 */
export function playPreset(options: PlayPresetOptions): gsap.core.Tween | undefined {
  const {
    targets,
    preset,
    reduced = false,
    delay,
    stagger,
    duration,
    ease,
    scrollTrigger,
    timeline,
    position,
    onComplete,
  } = options;

  const config = MOTION_PRESETS[preset];

  if (reduced) {
    // Land on the final visual state instantly. The UI is still correct —
    // it just skips the journey.
    gsap.set(targets, { ...config.to, clearProps: CLEAR_AFTER_REVEAL });
    onComplete?.();
    return undefined;
  }

  const toVars: gsap.TweenVars = {
    ...config.to,
    duration: duration ?? config.duration,
    ease: ease ?? config.ease,
    // Hand transform/filter control back to CSS once the reveal is done, so
    // `hover:-translate-y-1`-style utilities aren't fighting inline styles.
    clearProps: CLEAR_AFTER_REVEAL,
    ...(delay === undefined ? {} : { delay }),
    ...(stagger === undefined ? {} : { stagger }),
    ...(scrollTrigger ? { scrollTrigger } : {}),
    ...(onComplete ? { onComplete } : {}),
  };

  if (timeline) {
    timeline.fromTo(targets, config.from, toVars, position);
    return undefined;
  }

  return gsap.fromTo(targets, config.from, toVars);
}

export interface BatchRevealOptions {
  preset: MotionPresetName;
  reduced?: boolean;
  stagger?: number;
  start?: string;
  /** Group elements that enter within this many seconds of each other. */
  interval?: number;
  batchMax?: number;
}

/**
 * For long lists (>20 elements), one ScrollTrigger per item is wasteful.
 * `ScrollTrigger.batch` collapses them into shared triggers that animate
 * whatever entered together — same visual result, a fraction of the cost.
 */
export function batchReveal(
  targets: gsap.DOMTarget,
  options: BatchRevealOptions,
): InstanceType<typeof ScrollTrigger>[] {
  const {
    preset,
    reduced = false,
    stagger = STAGGER.tight,
    start = SCROLL.start,
    interval = 0.1,
    batchMax = 8,
  } = options;

  const config = MOTION_PRESETS[preset];

  if (reduced) {
    gsap.set(targets, { ...config.to, clearProps: CLEAR_AFTER_REVEAL });
    return [];
  }

  gsap.set(targets, config.from);

  return ScrollTrigger.batch(targets, {
    start,
    once: true,
    interval,
    batchMax,
    onEnter: (batch) => {
      playPreset({ targets: batch, preset, stagger });
    },
  });
}
