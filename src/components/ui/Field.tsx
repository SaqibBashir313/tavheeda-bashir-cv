import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useId,
} from 'react';

import { FieldContext, useFieldControlProps } from '@/components/ui/Field.context';
import { cn } from '@/lib/cn';

export interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string | null | undefined;
  required?: boolean;
  className?: string;
  /** Visually hide the label but keep it for assistive tech. */
  hideLabel?: boolean;
}

/**
 * Label + control + hint + error, with all the ARIA wiring done for you.
 * See `Field.context.ts` for why that wiring lives in one place.
 */
export function Field({
  label,
  children,
  hint,
  error,
  required = false,
  className,
  hideLabel = false,
}: FieldProps) {
  const uid = useId();
  const controlId = `${uid}-control`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <FieldContext.Provider
      value={{
        controlId,
        describedBy: describedBy || undefined,
        invalid: Boolean(error),
        required,
      }}
    >
      <div className={cn('space-y-2', className)}>
        <label
          htmlFor={controlId}
          className={cn('block text-sm font-medium text-content', hideLabel && 'sr-only')}
        >
          {label}
          {required ? (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>

        {children}

        {hint && !error ? (
          <p id={hintId} className="text-xs text-content-muted">
            {hint}
          </p>
        ) : null}

        {/* `role="alert"` so a validation failure is announced immediately. */}
        {error ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

const controlClasses = [
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-content',
  'placeholder:text-content-muted',
  'transition-[border-color,box-shadow,background-color] duration-200 ease-[var(--ease-out-soft)]',
  'hover:border-line-strong',
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25',
  'aria-invalid:border-danger aria-invalid:focus:ring-danger/25',
  'disabled:cursor-not-allowed disabled:opacity-50',
];

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    const fieldProps = useFieldControlProps();
    return <input ref={ref} {...fieldProps} className={cn(controlClasses, className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...props }, ref) {
  const fieldProps = useFieldControlProps();
  return (
    <textarea
      ref={ref}
      rows={rows}
      {...fieldProps}
      className={cn(controlClasses, 'resize-y', className)}
      {...props}
    />
  );
});
