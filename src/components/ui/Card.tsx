import { type HTMLAttributes } from 'react';

import { type CardVariantProps, cardVariants } from '@/components/ui/Card.variants';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement>, CardVariantProps {}

export function Card({ className, padding, elevation, interactive, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ padding, elevation, interactive }), className)} {...props} />
  );
}
