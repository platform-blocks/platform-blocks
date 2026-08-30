# Timeline

Timeline component displays a sequence of events or steps in chronological order with customizable styling and layout options.

## Metadata

- Canonical name: `Timeline`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Timeline } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: data
- Tags: timeline, chronological, events, history, steps
- Docs: https://react-ui-library.com/components/Timeline
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Timeline

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | ReactNode | Yes |  | Timeline items |
| `active` | number | No |  | Active item index - items before this will be highlighted |
| `color` | string | No |  | Timeline color. Palette token, `'primary.5'` shade syntax, or any CSS color. |
| `titleColor` | string | No |  | Default title color for all items |
| `descriptionColor` | string | No |  | Default description color for all items |
| `timestampColor` | string | No |  | Default timestamp color for all items |
| `lineWidth` | number | No |  | Line width |
| `bulletSize` | number | No |  | Bullet size |
| `align` | 'left' \| 'right' | No |  | Alignment of timeline |
| `reverseActive` | boolean | No |  | Reverse active highlighting |
| `size` | ComponentSizeValue | No |  | Component size |
| `centerMode` | boolean | No |  | Center mode renders a single central spine allowing items on both sides via itemAlign prop |

## Examples

### Project Milestones
ID: `Timeline.basic` • Tags: timeline • Category: basics • Status: stable • Since: 1.0.0

Use `Timeline.Item` components to communicate major project milestones alongside short descriptions.

```tsx
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
  return (
      <Timeline active={2}>
        {events.map((event) => (
          <Timeline.Item key={event.title} title={event.title}>
            <Text color="secondary" size="xs">
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
ID: `Timeline.alignment` • Tags: timeline, layout • Category: layout • Status: stable • Since: 1.0.0

Showcase left, right, and centered layouts by toggling `align` or `centerMode` on the timeline.

```tsx
const phases = [
  { title: 'Kickoff', description: 'Establish scope, goals, and responsible stakeholders.' },
  { title: 'Execution', description: 'Track feature work and unblock contributors.' },
  { title: 'Review', description: 'Collect feedback and iterate on the release candidate.' },
];
const signals = [
  { title: 'All Clear', description: 'No blockers detected.', align: 'left' as const, color: 'success.5' },
  { title: 'Caution', description: 'Risk detected for timeline.', align: 'right' as const, color: 'warning.5' },
  { title: 'Stop', description: 'Escalate critical issues before shipping.', align: 'left' as const, color: 'error.5' },
];
  return (
    <Block>
      <Text size="sm" color="secondary">
        Adjust alignment with the `align` prop or enable `centerMode` for timelines that alternate between sides.
      </Text>
      <Block>
        <Text weight="semibold">Left aligned (default)</Text>
        <Timeline>
          {phases.map((phase) => (
            <Timeline.Item key={`left-${phase.title}`} title={phase.title}>
              <Text size="sm">{phase.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>
      <Block>
        <Text weight="semibold">Right aligned</Text>
        <Timeline align="right" active={1}>
          {phases.map((phase) => (
            <Timeline.Item key={`right-${phase.title}`} title={phase.title}>
              <Text size="sm">{phase.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>
      <Block>
        <Text weight="semibold">Centered spine with per-item alignment</Text>
        <Timeline centerMode active={1}>
          {signals.map((signal) => (
            <Timeline.Item
              key={signal.title}
              title={signal.title}
              itemAlign={signal.align}
              color={signal.color}
            >
              <Text size="sm">{signal.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>
    </Block>
  );
}
```

### Bullet Customization
ID: `Timeline.bullets` • Tags: timeline, customization • Category: appearance • Status: stable • Since: 1.0.0

Swap bullet content or adjust bullet sizing using the `bullet` and `bulletSize` props.

```tsx
const bulletContent = [
  {
    title: 'Default bullet',
    description: 'Uses the configured timeline size for spacing.',
  },
  {
    title: 'Numbered bullet',
    description: 'Render a custom label with the `bullet` prop.',
    bullet: <Text size="xs" weight="semibold">1</Text>,
  },
  {
    title: 'Completed bullet',
    description: 'Swap in an icon to reinforce status.',
    bullet: <Icon name="check" size={12} color="#0E8A16" />,
  },
  {
    title: 'Pending bullet',
    description: 'Show remaining work with a clock icon.',
    bullet: <Icon name="clock" size={12} color="#F59E0B" />,
  },
];
const bulletSizes = [
  { label: 'Compact bullet (18px)', bulletSize: 18 },
  { label: 'Large bullet (28px)', bulletSize: 28 },
];
  return (
    <Block>
      <Text size="sm" color="secondary">
        Override bullet content or scale it with the `bullet` and `bulletSize` props.
      </Text>
      <Block>
        <Text weight="semibold">Custom bullet content</Text>
        <Timeline bulletSize={22}>
          {bulletContent.map((item) => (
            <Timeline.Item key={item.title} title={item.title} bullet={item.bullet}>
              <Text size="sm">{item.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>
      <Block>
        <Text weight="semibold">Adjust bullet size</Text>
        {bulletSizes.map((entry) => (
          <Timeline key={entry.label} bulletSize={entry.bulletSize}>
            <Timeline.Item title={entry.label}>
              <Text size="sm">Connector and spacing track with the bullet size.</Text>
            </Timeline.Item>
            <Timeline.Item title="Follow-up task">
              <Text size="sm">An additional item retains the same sizing.</Text>
            </Timeline.Item>
          </Timeline>
        ))}
      </Block>
    </Block>
  );
}
```

### Line Styling
ID: `Timeline.lineProps` • Tags: timeline, appearance • Category: appearance • Status: stable • Since: 1.0.0

Demonstrate how `color` and `lineWidth` affect the connector line.

```tsx
const launches = [
  { title: 'Announcement', description: 'Introduced the roadmap to stakeholders.' },
  { title: 'Preview', description: 'Shared early access resources with champions.' },
  { title: 'Release', description: 'Rolled the feature out to everyone.' },
];
  return (
    <Block>
      <Text size="sm" color="secondary">
        Customize the connector line globally with the `color` and `lineWidth` props on `Timeline`.
      </Text>
      <Block>
        <Text weight="semibold">Theme color</Text>
        <Timeline color="primary.6">
          {launches.map((milestone) => (
            <Timeline.Item key={`color-${milestone.title}`} title={milestone.title}>
              <Text size="sm">{milestone.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>
      <Block>
        <Text weight="semibold">Thicker connector</Text>
        <Timeline lineWidth={4}>
          {launches.slice(0, 2).map((milestone) => (
            <Timeline.Item key={`width-${milestone.title}`} title={milestone.title}>
              <Text size="sm">{milestone.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>
      <Block>
        <Text weight="semibold">Combined styling</Text>
        <Timeline color="success.6" lineWidth={3}>
          {launches.slice(1).map((milestone) => (
            <Timeline.Item key={`combined-${milestone.title}`} title={milestone.title}>
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
ID: `Timeline.lineVariants` • Tags: timeline, appearance • Category: appearance • Status: stable • Since: 1.0.0

Compare solid, dashed, and dotted connectors, including mixed variants within a single flow.

```tsx
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
  return (
    <Block direction="row" justify="space-between" fullWidth>
      {variantExamples.map((example) => (
        <Block key={example.label}>
          <Text weight="semibold">{example.label}</Text>
          <Timeline>
            {phases.map((title) => (
              <Timeline.Item key={`${example.label}-${title}`} title={title} lineVariant={example.variant} />
            ))}
          </Timeline>
        </Block>
      ))}
      <Block>
        <Text weight="semibold">Mix line variants</Text>
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
