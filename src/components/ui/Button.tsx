import { Slot, Slottable } from '@radix-ui/react-slot';
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';

import { type ButtonVariantProps, buttonVariants } from '@/components/ui/Button.variants';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  /** Render the styles onto the child element (e.g. a router `<Link>`). */
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    fullWidth,
    asChild = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      ref={ref}
      // `asChild` forwards to arbitrary elements (like <a>), which have no
      // `type` or `disabled` — only set them on a real button.
      {...(asChild ? {} : { type, disabled: disabled ?? isLoading })}
      aria-busy={isLoading || undefined}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {isLoading ? <Spinner size={size === 'lg' ? 'lg' : 'sm'} /> : leftIcon}
      {/*
        `Slot` clones exactly one child, so `asChild` + an icon would be three
        children and throw. `Slottable` marks which child is the element to
        become the root; the icons are then merged in as *its* children.
        Without this, `<Button asChild rightIcon={…}><Link/></Button>` crashes
        at runtime — and nothing in the type system catches it.
      */}
      {asChild ? <Slottable>{children}</Slottable> : children}
      {isLoading ? null : rightIcon}
    </Component>
  );
});
