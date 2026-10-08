import { Send } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { useContactForm } from '@/features/contact/hooks/useContactForm';

/**
 * The form is thin on purpose: `<Field />` owns every accessibility concern
 * (label association, `aria-describedby`, `aria-invalid`, error announcement)
 * and `useContactForm` owns validation and submission. This file is layout.
 */
export function ContactForm() {
  const { values, isSubmitting, setField, blurField, handleSubmit, errorFor } = useContactForm();

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" required error={errorFor('name')}>
          <Input
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={values.name}
            onChange={(event) => setField('name', event.target.value)}
            onBlur={() => blurField('name')}
          />
        </Field>

        <Field label="Email" required hint="We only use this to reply." error={errorFor('email')}>
          <Input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={(event) => setField('email', event.target.value)}
            onBlur={() => blurField('email')}
          />
        </Field>
      </div>

      <Field
        label="Message"
        required
        hint="Opportunity, solicitation number, due date, and how I can help."
        error={errorFor('message')}
      >
        <Textarea
          name="message"
          rows={6}
          placeholder="We have an RFP due in three weeks and need proposal management support…"
          value={values.message}
          onChange={(event) => setField('message', event.target.value)}
          onBlur={() => blurField('message')}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          rightIcon={<Send className="size-4" />}
        >
          {isSubmitting ? 'Sending…' : 'Send message'}
        </Button>
      </div>
    </form>
  );
}
