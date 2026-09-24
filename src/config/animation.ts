/**
 * The motion design system.
 *
 * Every animation in the app — GSAP or CSS — pulls its easing, duration,
 * stagger and from/to state from this file. Nothing hard-codes `0.6` or
 * `'power3.out'` inline. Retuning the whole product's feel is a one-file diff.
 *
 * The easing curves here are the GSAP equivalents of the `--ease-*` custom
 * properties in `src/styles/globals.css`; change them together.
 */

export const EASE = {
  /** Default: fast out, long settle. The "expensive" feel. */
  outSoft: 'power3.out',
  outExpo: 'expo.out',
  inOut: 'power2.inOut',
  /** For elements entering under a mask. */
  outMask: 'power4.out',
  /** Tiny overshoot — use sparingly, on small elements only. */
  backSoft: 'back.out(1.5)',
} as const;

export const DURATION = {
  instant: 0.12,
  xs: 0.2,
  sm: 0.32,
  md: 0.55,
  lg: 0.8,
  xl: 1.1,
} as const;

export const STAGGER = {
  tight: 0.035,
  base: 0.065,
  loose: 0.11,
} as const;

/** ScrollTrigger defaults. `start` is deliberately late so reveals feel earned. */
export const SCROLL = {
  start: 'top 85%',
  startLate: 'top 70%',
  end: 'bottom 20%',
  /** Pinned horizontal rails need a longer scrub distance. */
  scrub: 1,
} as const;

export type MotionPresetName =
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'rise'
  | 'scale-in'
  | 'blur-in'
  | 'clip-up';

export interface MotionPreset {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
  duration?: number;
  ease?: string;
}

/**
 * Presets are declarative so a single runner (`playPreset`) can execute them,
 * and so reduced-motion mode can jump straight to the `to` state.
 *
 * Only `transform`, `opacity` and `clip-path` are animated — all compositor
 * friendly. No `top`/`left`/`height` tweens anywhere in this codebase.
 */
export const MOTION_PRESETS: Record<MotionPresetName, MotionPreset> = {
  fade: {
    from: { autoAlpha: 0 },
    to: { autoAlpha: 1 },
  },
  'fade-up': {
    from: { autoAlpha: 0, y: 28 },
    to: { autoAlpha: 1, y: 0 },
  },
  'fade-down': {
    from: { autoAlpha: 0, y: -28 },
    to: { autoAlpha: 1, y: 0 },
  },
  'fade-left': {
    from: { autoAlpha: 0, x: 36 },
    to: { autoAlpha: 1, x: 0 },
  },
  'fade-right': {
    from: { autoAlpha: 0, x: -36 },
    to: { autoAlpha: 1, x: 0 },
  },
  /** The signature entrance: mask-adjacent lift with a long tail. */
  rise: {
    from: { autoAlpha: 0, y: 64, rotateX: -18, transformOrigin: '50% 100%' },
    to: { autoAlpha: 1, y: 0, rotateX: 0 },
    duration: DURATION.lg,
    ease: EASE.outExpo,
  },
  'scale-in': {
    from: { autoAlpha: 0, scale: 0.94 },
    to: { autoAlpha: 1, scale: 1 },
    duration: DURATION.sm,
    ease: EASE.outSoft,
  },
  'blur-in': {
    from: { autoAlpha: 0, filter: 'blur(10px)', y: 16 },
    to: { autoAlpha: 1, filter: 'blur(0px)', y: 0 },
    duration: DURATION.lg,
  },
  /** For images / cards: reveals by shrinking an inset clip. */
  'clip-up': {
    from: { clipPath: 'inset(100% 0% 0% 0%)', y: 24 },
    to: { clipPath: 'inset(0% 0% 0% 0%)', y: 0 },
    duration: DURATION.xl,
    ease: EASE.outMask,
  },
};

/** Text-reveal defaults, shared by `<AnimatedText />` and the split utility. */
export const TEXT_REVEAL = {
  char: { y: '110%', duration: DURATION.lg, stagger: 0.018, ease: EASE.outMask },
  word: { y: '110%', duration: DURATION.lg, stagger: STAGGER.tight, ease: EASE.outMask },
  line: { y: '110%', duration: DURATION.xl, stagger: STAGGER.base, ease: EASE.outMask },
} as const;

/** Page transition timings. Exit must stay short — it is dead time for the user. */
export const PAGE_TRANSITION = {
  exitDuration: DURATION.xs,
  enterDuration: DURATION.md,
  exitEase: EASE.inOut,
  enterEase: EASE.outSoft,
} as const;
