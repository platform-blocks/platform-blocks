import { Button, Tooltip } from '@plocks/ui';

export function Demo() {
  return (
    <Tooltip label="Invite teammates" withArrow>
      <Button size="sm" variant="outline">
        Invite teammates
      </Button>
    </Tooltip>
  );
}
