# Timeline

Timeline component displays a sequence of events or steps in chronological order with customizable styling and layout options.

## Metadata

- Import: `import { Timeline } from '@plocks/ui';`
- Tags: timeline, chronological, events, history, steps
- Docs: https://plocks.dev/components/Timeline
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Timeline

## Props

- `children` (required): ReactNode — Timeline items
- `active`: number — Active item index - items before this will be highlighted
- `color`: ColorProp — Timeline color. Palette token, `'primary.5'` shade syntax, or any CSS color.
- `titleColor`: string — Default title color for all items
- `descriptionColor`: string — Default description color for all items
- `timestampColor`: string — Default timestamp color for all items
- `lineWidth`: number — Line width
- `bulletSize`: number — Bullet size
- `align`: 'left' | 'right' — Side of the spine the content sits on (`left` = start side, `right` = end side; they flip under RTL)
- `reverseActive`: boolean — Reverse active highlighting
- `size`: SizeValue — Component size: a size token, or the title font size in px
- `centerMode`: boolean — Center mode renders a single central spine allowing items on both sides via itemAlign prop
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

### Timeline.Item

- `children`: ReactNode — Item content
- `title`: string — Item title
- `timestamp`: ReactNode — Optional timestamp text or node
- `bullet`: ReactNode — Custom bullet content (icon, avatar, etc.)
- `lineVariant`: 'solid' | 'dashed' | 'dotted' — Line variant for this item
- `color`: ColorProp — Item color (overrides timeline color). Palette token, `'primary.5'` shade syntax, or any CSS color.
- `titleColor`: string — Override title text color for this item
- `descriptionColor`: string — Override description text color for this item
- `timestampColor`: string — Override timestamp text color for this item
- `active`: boolean — Whether this item is active
- `itemAlign`: 'left' | 'right' — Override timeline alignment for this specific item (`left` = start side, `right` = end side; they flip under RTL)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Use `Timeline.Item` components to communicate major project milestones alongside short descriptions.

```tsx
import { Text, Timeline } from '@plocks/ui';

const events = [
  {
    title: 'Discovery',
    description: 'Ran stakeholder interviews and confirmed the project scope.',
    timestamp: '3 weeks ago',
  },
  {
    title: 'Design',
    description: 'Delivered the initial design system and screen mocks.',
    timestamp: '2 weeks ago',
  },
  {
    title: 'Development',
    description: 'Implementing core flows while gathering early feedback.',
    timestamp: 'Last week',
  },
  {
    title: 'Validation',
    description: 'QA pass is underway with regression tracking in place.',
    timestamp: 'In progress',
  },
];

export function Demo() {
  return (
    <Timeline active={2}>
      {events.map((event) => (
        <Timeline.Item key={event.title} title={event.title}>
          <Text c="secondary" size="xs">
            {event.timestamp}
          </Text>
          <Text size="sm">{event.description}</Text>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
```

### Alignment Options

Showcase left, right, and centered layouts by toggling `align` or `centerMode` on the timeline.

```tsx
import { Block, Text, Timeline } from '@plocks/ui';

const phases = [
  { title: 'Kickoff', description: 'Establish scope, goals, and responsible stakeholders.' },
  { title: 'Execution', description: 'Track feature work and unblock contributors.' },
  { title: 'Review', description: 'Collect feedback and iterate on the release candidate.' },
];

export function Demo() {
  return (
    <Block fullWidth gap="lg">
      <Block>
        <Text fw="semibold">Left</Text>
        <Timeline>
          {phases.map((phase) => (
            <Timeline.Item key={phase.title} title={phase.title}>
              <Text size="sm">{phase.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>

      <Block>
        <Text fw="semibold">Right</Text>
        <Timeline align="right">
          {phases.map((phase) => (
            <Timeline.Item key={phase.title} title={phase.title}>
              <Text size="sm">{phase.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>

      <Block>
        <Text fw="semibold">Center</Text>
        <Timeline centerMode>
          {phases.map((phase) => (
            <Timeline.Item key={phase.title} title={phase.title}>
              <Text size="sm">{phase.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>
    </Block>
  );
}
```

### Bullet Customization

Swap bullet content or adjust bullet sizing using the `bullet` and `bulletSize` props.

```tsx
import { Block, Icon, Text, Timeline } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Timeline bulletSize={28}>
        <Timeline.Item title="Default" />
        <Timeline.Item title="Numbered" bullet={<Text size="xs" fw="semibold">1</Text>} />
        <Timeline.Item title="Completed" bullet={<Icon name="check" size={12} color="#0E8A16" />} />
        <Timeline.Item title="Pending" bullet={<Icon name="clock" size={12} color="#F59E0B" />} />
      </Timeline>
    </Block>
  );
}
```

### Line Styling

Demonstrate how `color` and `lineWidth` affect the connector line.

```tsx
import { Block, Text, Timeline } from '@plocks/ui';

const launches = [
  { title: 'Announcement', description: 'Introduced the roadmap to stakeholders.' },
  { title: 'Preview', description: 'Shared early access resources with champions.' },
  { title: 'Release', description: 'Rolled the feature out to everyone.' },
];

export function Demo() {
  return (
    <Block fullWidth gap="lg">
      <Block>
        <Text fw="semibold">Theme color</Text>
        <Timeline color="primary.6">
          {launches.map((milestone) => (
            <Timeline.Item key={milestone.title} title={milestone.title}>
              <Text size="sm">{milestone.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>

      <Block>
        <Text fw="semibold">Thicker connector</Text>
        <Timeline lineWidth={4}>
          {launches.map((milestone) => (
            <Timeline.Item key={milestone.title} title={milestone.title}>
              <Text size="sm">{milestone.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>

      <Block>
        <Text fw="semibold">Combined styling</Text>
        <Timeline color="success.6" lineWidth={3}>
          {launches.map((milestone) => (
            <Timeline.Item key={milestone.title} title={milestone.title}>
              <Text size="sm">{milestone.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>
    </Block>
  );
}
```

### Line Variants

Compare solid, dashed, and dotted connectors, including mixed variants within a single flow.

```tsx
import { Block, Text, Timeline } from '@plocks/ui';

const phases = ['Start', 'Plan', 'Build'];

const variantExamples = [
  { label: 'Solid (default)', variant: undefined },
  { label: 'Dashed', variant: 'dashed' as const },
  { label: 'Dotted', variant: 'dotted' as const },
];

const releaseFlow = [
  { title: 'Planning', variant: 'solid' as const },
  { title: 'Design', variant: 'dashed' as const },
  { title: 'Development', variant: 'dotted' as const },
  { title: 'QA', variant: 'dashed' as const },
  { title: 'Launch', variant: 'solid' as const },
];

export function Demo() {
  return (
    <Block direction="row" justify="space-between" fullWidth>
      {variantExamples.map((example) => (
        <Block key={example.label}>
          <Text fw="semibold">{example.label}</Text>
          <Timeline>
            {phases.map((title) => (
              <Timeline.Item key={`${example.label}-${title}`} title={title} lineVariant={example.variant} />
            ))}
          </Timeline>
        </Block>
      ))}
      <Block>
        <Text fw="semibold">Mix line variants</Text>
        <Timeline>
          {releaseFlow.map((step) => (
            <Timeline.Item key={step.title} title={step.title} lineVariant={step.variant} />
          ))}
        </Timeline>
      </Block>
    </Block>
  );
}
```
