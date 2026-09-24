import { type HTMLAttributes } from 'react';

import { type BadgeVariantProps, badgeVariants } from '@/components/ui/Badge.variants';
import { cn } from '@/lib/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, BadgeVariantProps {}

export function Badge({ className, tone, size, outlined, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size, outlined }), className)} {...props} />;
}
