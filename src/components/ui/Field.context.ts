import { createContext, useContext } from 'react';

export interface FieldContextValue {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
}

export const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * Every accessible form control needs the same five things wired together:
 * a label `for`, a control `id`, `aria-describedby` pointing at the hint AND
 * the error, `aria-invalid`, and `aria-required`.
 *
 * Getting that wrong is the most common a11y defect in React forms, so it is
 * solved once — here — and consumed through context. `<Input />` and
 * `<Textarea />` spread the result and never think about it again.
 *
 * Returns an empty object when used outside a `<Field />`, so the controls
 * remain usable standalone.
 */
export function useFieldControlProps() {
  const context = useContext(FieldContext);
  if (!context) return {};

  return {
    id: context.controlId,
    'aria-describedby': context.describedBy,
    'aria-invalid': context.invalid || undefined,
    'aria-required': context.required || undefined,
  } as const;
}
