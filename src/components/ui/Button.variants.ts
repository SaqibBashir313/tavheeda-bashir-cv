import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Variants live in `cva` rather than in conditionals inside the component.
 * Adding a variant is a data change; it cannot introduce a branch bug, and
 * the prop union type is derived from it automatically.
 *
 * They live in their own module (not next to the component) for two reasons:
 * Fast Refresh only works on files that export components, and styles are
 * then importable by anything that needs to look like a button without being
 * one — e.g. a `<Link>`.
 *
 * Micro-interactions here are CSS transitions, not GSAP: a hover or press is
 * a single-property, sub-200ms change that the compositor does for free.
 * GSAP is reserved for orchestrated, multi-element or scroll-bound motion
 * where a timeline actually earns its keep.
 */
export const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap select-none',
    'font-medium tracking-[-0.01em]',
    'transition-[background-color,border-color,color,box-shadow,transform] duration-200',
    'ease-[var(--ease-out-soft)] active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-45',
    'aria-busy:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-brand text-brand-contrast shadow-subtle hover:bg-brand-hover',
        secondary:
          'border border-line bg-surface-raised text-content shadow-subtle hover:border-line-strong hover:bg-surface-sunken',
        outline: 'border border-line-strong text-content hover:bg-surface-sunken',
        ghost: 'text-content-secondary hover:bg-surface-sunken hover:text-content',
        danger: 'bg-danger text-white shadow-subtle hover:brightness-110',
        link: 'h-auto p-0 text-brand underline-offset-4 hover:underline active:scale-100',
      },
      size: {
        sm: 'h-9 rounded-full px-4 text-sm',
        md: 'h-11 rounded-full px-5 text-sm',
        lg: 'h-12 rounded-full px-7 text-base',
        icon: 'size-10 rounded-full p-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
