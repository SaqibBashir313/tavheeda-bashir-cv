import { type ReactNode, useRef } from 'react';

import { usePrefersReducedMotion } from '@/hooks';
import { gsap } from '@/lib/gsap';

export interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees (default: 8) */
  maxTilt?: number;
  /** Perspective depth (default: 1000) */
  perspective?: number;
}

/**
 * 3D tilt card that follows mouse movement. Applies rotation and scale on hover.
 * Respects prefers-reduced-motion and returns to neutral on mouse leave.
 *
 * @example
 * <TiltCard maxTilt={12} perspective={800}>
 *   <Card>Content here</Card>
 * </TiltCard>
 */
export function TiltCard({ children, className, maxTilt = 8, perspective = 1000 }: TiltCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * maxTilt * -1;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxTilt;

    gsap.to(containerRef.current, {
      rotationX: rotateX,
      rotationY: rotateY,
      duration: 0.6,
      overwrite: 'auto',
    });
  };

  const handleMouseLeave = () => {
    if (reduced || !containerRef.current) return;

    gsap.to(containerRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        perspective: reduced ? 'none' : `${perspective}px`,
        transformStyle: 'preserve-3d',
      } as React.CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
