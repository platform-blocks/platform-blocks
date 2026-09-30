import { Button, Row, Tooltip } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="md" wrap="wrap">
      <Tooltip label="Opens after 400ms" openDelay={400} closeDelay={200}>
        <Button size="sm" variant="outline">
          Delayed tooltip
        </Button>
      </Tooltip>
      <Tooltip
        label="This tooltip wraps across multiple lines so you can surface longer instructions without truncation."
        maw={220}
        withArrow
      >
        <Button size="sm">
          Wrapped tooltip
        </Button>
      </Tooltip>
    </Row>
  );
}
