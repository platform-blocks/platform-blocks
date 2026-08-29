import { Block, Button, Card, Text, Tooltip } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Card p="md">
      <Block>
        <Block>
          <Text size="sm" color="secondary">
            Add open and close delays to avoid flicker when the pointer briefly leaves the trigger.
          </Text>
          <Tooltip label="Opens after 400ms" openDelay={400} closeDelay={200}>
            <Button size="sm" variant="outline">
              Delayed tooltip
            </Button>
          </Tooltip>
        </Block>
        <Block>
          <Text size="sm" color="secondary">
            Long labels wrap automatically. Tighten or widen the wrap point with `maxWidth`.
          </Text>
          <Tooltip
            label="This tooltip wraps across multiple lines so you can surface longer instructions without truncation."
            maxWidth={220}
            withArrow
          >
            <Button size="sm">
              Wrapped tooltip
            </Button>
          </Tooltip>
        </Block>
        <Block>
          <Text size="sm" color="secondary">
            Components with a `tooltip` prop take a string, or an object to pass any Tooltip option.
          </Text>
          <Button
            size="sm"
            variant="outline"
            tooltip={{
              label: 'The object form forwards straight to Tooltip, so you can widen the bubble or add an arrow.',
              maxWidth: 320,
              position: 'right',
              withArrow: true
            }}
          >
            Tooltip via prop
          </Button>
        </Block>
      </Block>
    </Card>
  );
}
