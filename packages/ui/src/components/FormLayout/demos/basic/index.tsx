import { FormLayout, FormSection, Input } from '@plocks/ui';

export function Demo() {
  return (
    <FormLayout variant="card">
      <FormSection title="Profile">
        <Input label="Name" placeholder="Your name" />
        <Input label="Email" placeholder="you@example.com" />
      </FormSection>
    </FormLayout>
  );
}
