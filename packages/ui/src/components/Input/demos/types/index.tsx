import { Block, Input } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Block>
      <Input type="email" label="Email address" placeholder="user@example.com" />
      <Input type="password" label="Password" placeholder="Enter your password" />
      <Input type="number" label="Age" placeholder="Enter your age" />
      <Input type="tel" label="Phone number" placeholder="+1 (555) 123-4567" />
    </Block>
  );
}
