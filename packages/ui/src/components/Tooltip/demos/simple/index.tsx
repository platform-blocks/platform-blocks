import { Button, Row, Tooltip } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Row gap="md" wrap="wrap">
      <Tooltip label="Default hover and focus behavior">
        <Button size="sm">Hover or focus</Button>
      </Tooltip>
      <Tooltip
        label="Only appears when the button receives focus"
        events={{ hover: false, focus: true, touch: false }}
      >
        <Button size="sm" variant="outline">
          Focus only
        </Button>
      </Tooltip>
      <Tooltip
        label="Shows on touch interactions"
        events={{ hover: false, focus: false, touch: true }}
      >
        <Button size="sm" variant="ghost">
          Touch only
        </Button>
      </Tooltip>
    </Row>
  );
}
