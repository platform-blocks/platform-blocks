import { CopyButton } from '@platform-blocks/ui';

const longToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.long.payload.value.with.many.sections.and.characters.for.demo.purposes.only';

export function Demo() {
  return <CopyButton value={longToken} iconOnly={false} label="Copy Token" />;
}
