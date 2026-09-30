import type { ReactNode } from 'react';
import { Badge, Row, useVisibility } from '@plocks/ui';
import type { VisibilityProps } from '@plocks/ui';

type TagProps = VisibilityProps & { children: ReactNode };

function Tag({ children, ...visibility }: TagProps) {
  const visible = useVisibility(visibility);
  if (!visible) return null;

  return <Badge size="lg">{children}</Badge>;
}

export function Demo() {
  return (
    <Row gap="sm">
      <Tag hiddenFrom="md">Below md</Tag>
      <Tag visibleFrom="md">md and up</Tag>
      <Tag darkHidden>Light scheme</Tag>
      <Tag lightHidden>Dark scheme</Tag>
    </Row>
  );
}
