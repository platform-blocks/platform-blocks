import { Block, Input } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Input type="email" label="Email address" placeholder="user@example.com" />
      <Input type="password" label="Password" placeholder="Enter your password" />
      <Input type="number" label="Age" placeholder="Enter your age" />
      <Input type="tel" label="Phone number" placeholder="+1 (555) 123-4567" />
    </Block>
  );
}
