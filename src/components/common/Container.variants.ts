import { cva, type VariantProps } from 'class-variance-authority';

export const containerVariants = cva('mx-auto w-full', {
  variants: {
    width: {
      prose: 'max-w-[68ch]',
      content: 'max-w-5xl',
      wide: 'max-w-7xl',
      full: 'max-w-none',
    },
    gutter: {
      true: 'px-6 sm:px-8 lg:px-12',
      false: '',
    },
  },
  defaultVariants: { width: 'wide', gutter: true },
});

export type ContainerVariantProps = VariantProps<typeof containerVariants>;

/** Vertical rhythm steps for `<Section />`. */
export const SECTION_SPACE = {
  sm: 'py-14 sm:py-20',
  md: 'py-20 sm:py-28',
  lg: 'py-28 sm:py-40',
} as const;
