import { cva, type VariantProps } from 'class-variance-authority';

export const cardVariants = cva(
  'rounded-2xl border border-line bg-surface-raised transition-[border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-soft)]',
  {
    variants: {
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      elevation: {
        flat: 'shadow-none',
        raised: 'shadow-card',
      },
      /** Hover lift for cards that are links or buttons. Never for static ones. */
      interactive: {
        true: 'hover:-translate-y-1 hover:border-line-strong hover:shadow-popover',
      },
    },
    defaultVariants: {
      padding: 'md',
      elevation: 'raised',
    },
  },
);

export type CardVariantProps = VariantProps<typeof cardVariants>;
