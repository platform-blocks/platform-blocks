# Tooltip

Tooltip provides contextual information without disrupting the user's workflow. It supports multiple trigger events, smart positioning, and accessibility features for an inclusive experience.

## Metadata

- Canonical name: `Tooltip`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Tooltip } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: overlay
- Docs: https://react-ui-library.com/components/Tooltip
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Tooltip

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | React.ReactNode | Yes |  | Tooltip label |
| `position` | TooltipPositionType | No | 'top' | Position of the tooltip |
| `withArrow` | boolean | No | false | Whether to show an arrow |
| `color` | string | No |  | Tooltip color |
| `radius` | SizeValue | No | 'md' | Border radius |
| `offset` | number | No | 8 | Offset from target |
| `width` | number | No |  | Fixed bubble width. Omit to size to content (capped by `maxWidth`). |
| `maxWidth` | number | No | 280 | Largest width the bubble may grow to before the label wraps. Also clamped by the available viewport space. |
| `lineClamp` | number | No |  | Clamp the label to N lines with an ellipsis. Unset = wrap freely. |
| `opened` | boolean | No |  | Whether tooltip is controlled |
| `openDelay` | number | No | 0 | Open delay in ms |
| `closeDelay` | number | No | 0 | Close delay in ms |
| `events` | { hover?: boolean; focus?: boolean; touch?: boolean; } | No |  | Events that trigger tooltip |
| `children` | React.ReactElement | Yes |  | Children element to attach tooltip to |
| `style` | StyleProp<ViewStyle> | No |  | Container style |
| `testID` | string | No |  | Test ID for testing |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the label `<Text>` (style, weight, ff, size, color). |

## Examples

### Advanced
ID: `Tooltip.advanced` • Category: general

title: Advanced Tooltip Features description: Advanced tooltip options including delays, wrapped labels, width control, and the object form of the tooltip prop. tags: ["advanced", "delays", "wrapping", "maxWidth", "controlled", "custom-color", "width"] --- title: Delays and Content category: behavior order: 40 tags: [delays, wrapping] highlightLines: [11-44] status: stable since: 1.0.0 hidden: false --- Tune `openDelay`/`closeDelay` to reduce flicker. Long labels wrap on their own — use `maxWidth` to move the wrap point, `width` for a fixed bubble, or `lineClamp` to truncate on purpose.

```tsx
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
```

### Basic
ID: `Tooltip.basic` • Category: general

title: Basic Tooltip description: Simple tooltip display on hover/press with different trigger events. tags: ["basic", "events", "hover", "focus", "touch", "triggers"] --- title: Basic Usage category: usage order: 10 tags: [tooltip] highlightLines: [9-15] status: stable since: 1.0.0 hidden: false --- Wrap a control in `Tooltip` to display concise helper text on hover, focus, or touch.

```tsx
return (
    <Card p="md">
      <Block align="flex-start">
        <Text size="sm" color="secondary">
          Wrap interactive elements with `Tooltip` to introduce short helper text.
        </Text>
        <Tooltip label="Invite teammates" withArrow>
          <Button size="sm" variant="outline">
            Invite teammates
          </Button>
        </Tooltip>
      </Block>
    </Card>
  );
}
```

### Positions
ID: `Tooltip.positions` • Category: general

title: Tooltip Positions description: Different positioning options for tooltips with smart edge detection and arrow indicators. tags: ["positions", "positioning", "arrows", "edge-detection", "alignment"] --- title: Positions category: behavior order: 30 tags: [positioning] highlightLines: [12-31] status: stable since: 1.0.0 hidden: false --- Set `position` to top, bottom, left, or right to anchor the tooltip relative to its trigger.

```tsx
return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Pass a `position` value to choose where the tooltip appears.
        </Text>
        <Row gap="md" justify="center" wrap="wrap">
          <Tooltip label="Appears above the target" position="top" withArrow>
            <Button size="sm" variant="outline">
              Top
            </Button>
          </Tooltip>
          <Tooltip label="Appears below the target" position="bottom" withArrow>
            <Button size="sm" variant="outline">
              Bottom
            </Button>
          </Tooltip>
          <Tooltip label="Anchors to the left" position="left" withArrow>
            <Button size="sm" variant="outline">
              Left
            </Button>
          </Tooltip>
          <Tooltip label="Anchors to the right" position="right" withArrow>
            <Button size="sm" variant="outline">
              Right
            </Button>
          </Tooltip>
        </Row>
      </Block>
    </Card>
  );
}
```

### Simple
ID: `Tooltip.simple` • Category: general

title: Simple Tooltip description: Basic tooltip demonstration with different positions, arrows, and multiline text. tags: ["simple", "basic", "positions", "arrow", "multiline"] --- title: Trigger Modes category: behavior order: 20 tags: [events, interaction] highlightLines: [13-33] status: stable since: 1.0.0 hidden: false --- Configure the `events` prop to decide whether tooltips appear on hover, focus, or touch interactions.

```tsx
return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Adjust the `events` prop to control which interactions display the tooltip.
        </Text>
        <Block>
          <Row gap="sm" align="center">
            <Tooltip label="Default hover and focus behavior">
              <Button size="sm">Hover or focus</Button>
            </Tooltip>
          </Row>
          <Row gap="sm" align="center">
            <Tooltip
              label="Only appears when the button receives focus"
              events={{ hover: false, focus: true, touch: false }}
            >
              <Button size="sm" variant="outline">
                Focus only
              </Button>
            </Tooltip>
          </Row>
          <Row gap="sm" align="center">
            <Tooltip
              label="Shows on touch interactions"
              events={{ hover: false, focus: false, touch: true }}
            >
              <Button size="sm" variant="ghost">
                Touch only
              </Button>
            </Tooltip>
          </Row>
        </Block>
      </Block>
    </Card>
  );
}
```
