import { type FormEvent, useCallback, useState } from 'react';

import { type ContactPayload, submitContact } from '@/features/contact/api/contact.api';
import { toast } from '@/features/notifications';
import { getErrorMessage } from '@/utils/error';

type FieldName = keyof ContactPayload;
type Errors = Partial<Record<FieldName, string>>;

const EMPTY: ContactPayload = { name: '', email: '', message: '' };

/**
 * Validators as data, one per field.
 *
 * Keeping them in a map means `validate()` is a single `Object.entries` loop
 * instead of a growing pile of `if` statements, and adding a field is one
 * entry rather than an edit in three places.
 */
const VALIDATORS: Record<FieldName, (value: string) => string | null> = {
  name: (value) => (value.trim().length < 2 ? 'Please enter your name.' : null),
  email: (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? null : 'Enter a valid email address.',
  message: (value) =>
    value.trim().length < 20 ? 'A little more detail helps — 20 characters minimum.' : null,
};

export function useContactForm() {
  const [values, setValues] = useState<ContactPayload>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback((field: FieldName, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    // Clear the error as soon as the user starts fixing it; re-validation
    // happens on blur and on submit.
    setErrors((previous) => (previous[field] ? { ...previous, [field]: undefined } : previous));
  }, []);

  const validateField = useCallback((field: FieldName, value: string) => {
    const error = VALIDATORS[field](value);
    setErrors((previous) => ({ ...previous, [field]: error ?? undefined }));
    return error;
  }, []);

  const blurField = useCallback(
    (field: FieldName) => {
      setTouched((previous) => ({ ...previous, [field]: true }));
      validateField(field, values[field]);
    },
    [validateField, values],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const nextErrors = Object.fromEntries(
        (Object.keys(VALIDATORS) as FieldName[])
          .map((field) => [field, VALIDATORS[field](values[field])] as const)
          .filter(([, error]) => error !== null),
      ) as Errors;

      setTouched({ name: true, email: true, message: true });
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        // Move focus to the first offender — a validation summary nobody can
        // find is not accessible.
        const firstInvalid = (Object.keys(VALIDATORS) as FieldName[]).find(
          (field) => nextErrors[field],
        );
        if (firstInvalid) {
          event.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
        }
        return;
      }

      setIsSubmitting(true);
      try {
        await submitContact(values);
        setValues(EMPTY);
        setTouched({});
        toast.success('Message sent', {
          description: 'We reply to everything within two business days.',
        });
      } catch (cause) {
        toast.error('Could not send your message', { description: getErrorMessage(cause) });
      } finally {
        setIsSubmitting(false);
      }
    },
    [values],
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setField,
    blurField,
    handleSubmit,
    /** Only show an error once the user has interacted with the field. */
    errorFor: (field: FieldName) => (touched[field] ? errors[field] : undefined),
  };
}
