import { Button, Tooltip } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Tooltip label="Invite teammates" withArrow>
      <Button size="sm" variant="outline">
        Invite teammates
      </Button>
    </Tooltip>
  );
}
