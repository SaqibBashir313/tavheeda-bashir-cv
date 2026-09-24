import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full text-xs font-medium tracking-[-0.005em]',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-sunken text-content-secondary',
        brand: 'bg-brand/10 text-brand',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        danger: 'bg-danger-soft text-danger',
        info: 'bg-info-soft text-info',
      },
      size: {
        sm: 'px-2 py-0.5',
        md: 'px-2.5 py-1',
      },
      outlined: {
        true: 'border border-current/20 bg-transparent',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'sm' },
  },
);

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
