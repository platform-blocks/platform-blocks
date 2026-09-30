import { Block, Input, KeyboardAwareLayout } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth h={220}>
      <KeyboardAwareLayout>
        <Block p="md" gap="md">
          <Input label="Name" placeholder="Your name" />
          <Input label="Email" placeholder="you@example.com" />
        </Block>
      </KeyboardAwareLayout>
    </Block>
  );
}
