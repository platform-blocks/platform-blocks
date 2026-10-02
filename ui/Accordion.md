# Accordion

The Accordion component groups related content into expandable sections.

## Metadata

- Import: `import { Accordion } from '@plocks/ui';`
- Tags: collapse, expand, panel, ui, content-grouping
- Docs: https://plocks.dev/components/Accordion
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Accordion

## Props

- `items` (required): AccordionItem[] — Ordered list of items to render. The `key` for each item must be unique.
- `type`: 'single' | 'multiple' = 'single' — Expansion behavior. 'single' ensures only one item can be expanded at a time; 'multiple' allows independent expansion.
- `defaultExpanded`: string[] = [] — Initial expanded item keys (uncontrolled). Ignored when `expanded` is provided. For `type="single"` only the first key is used at initialization.
- `expanded`: string[] — Controlled set of expanded item keys. Provide alongside `onExpandedChange`.
- `onExpandedChange`: (expanded: string[]) => void — Called when the expanded keys change (both controlled & uncontrolled flows).
- `onItemToggle`: OnAccordionToggle — Per-item toggle event with rich metadata. Fires after state resolution.
- `variant`: 'default' | 'separated' | 'bordered' = 'default' — Visual variant style preset.
- `size`: SizeValue = 'md' — Size scale controlling paddings, font sizes, and icon dimensions.
- `color`: ThemeColor = undefined — Brand accent applied to the expanded item (title, chevron, and a subtle surface tint). Opt-in — when unset, the open state stays neutral and reads from the bolded title and rotated chevron alone.
- `showChevron`: boolean = true — Whether to render the chevron affordance.
- `chevronPosition`: 'start' | 'end' = 'end' — Chevron placement relative to the header text.
- `density`: 'comfortable' | 'compact' | 'spacious' = 'comfortable' — Space efficiency / vertical density preset.
- `radius`: RadiusValue — Corner radius of the `separated` items / `bordered` frame: a radius token, px number, `'none'` or `'full'`.
- `headerStyle`: StyleProp<ViewStyle> — Header row style override applied to each item.
- `contentStyle`: StyleProp<ViewStyle> — Collapsible content container style override.
- `headerTextStyle`: StyleProp<TextStyle> — Text style applied to the header label.
- `titleProps`: Omit<TextProps, 'children'> — Override props applied to each item's header `<Text>` (style, fw, ff, size, c). Applies to every item in the accordion.
- `persistKey`: string — Explicit persistence key. If omitted, an automatic hash key will be generated when uncontrolled.
- `autoPersist`: boolean = true — Enables persistence of expanded state (uncontrolled only) across remounts in-process.
- `animated`: AccordionAnimationProp = true — Enables animation or accepts a config object for custom durations & easing.
- `transitionDuration`: number = 220 — Length of the expand/collapse transition (chevron spin + panel height) in ms. Takes precedence over `animated`; `0` renders state changes instantly. Always 0 when the user prefers reduced motion.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface AccordionItem {
  /**
   * Unique identifier for the item. Must be stable across renders.
   */
  key: string;
  /**
   * Header label rendered in the item trigger row.
   */
  title: string;
  /**
   * Collapsible body content shown when the item is expanded.
   */
  content: ReactNode;
  /**
   * Disables user interaction and visually indicates the item is inactive.
   */
  disabled?: boolean;
  /**
   * Optional decorative or status icon rendered alongside the title.
   */
  icon?: ReactNode;
  /**
   * Overrides the accordion-level `color` for this item's expanded emphasis
   * (title, chevron, and surface tint). Lets a single accordion mix accents.
   */
  color?: ThemeColor;
}

export type OnAccordionToggle = (detail: AccordionToggleDetail) => void;

export type AccordionAnimationProp = boolean | { duration?: number; easing?: (t: number) => number };

export interface AccordionToggleDetail {
  itemKey: string;
  expanded: boolean;
  expandedKeys: string[];
  type: AccordionType;
  variant: AccordionVariant | undefined;
}
```

## Examples

### Basics

Allow only one item to open at a time by setting `type="single"` and passing an items array.

```tsx
import { Accordion } from '@plocks/ui';
import { faqItems } from '../data';

export function Demo() {
  return <Accordion type="single" items={faqItems} />;
}
```

`data.ts`

```ts
import React from 'react';
import { Text } from '@plocks/ui';
import type { AccordionItemType } from '@plocks/ui';

// Wrap body copy in <Text> without JSX so this stays a plain `.ts` data module
// (a `.tsx` sibling would be picked up as its own demo by the docs generator).
const body = (text: string) => React.createElement(Text, { size: 'sm' }, text);

export const faqItems: AccordionItemType[] = [
  {
    key: 'foundation',
    title: 'What is plocks?',
    content: body('A cross-platform design system for shipping polished React Native apps faster.'),
  },
  {
    key: 'benefits',
    title: 'Why use an accordion?',
    content: body('Keep dense guidance scannable while letting readers expand only what they need.'),
  },
  {
    key: 'next-steps',
    title: 'How do I get started?',
    content: body('Install the package, drop the provider at the root, and follow the onboarding checklist.'),
  },
];

export const knowledgeBase: AccordionItemType[] = [
  {
    key: 'collaboration',
    title: 'Invite collaborators',
    content: body('Share the project with teammates to co-author docs and keep decisions centralized.'),
  },
  {
    key: 'appearance',
    title: 'Customize the theme',
    content: body('Extend the default theme tokens with your brand colors and typography.'),
  },
  {
    key: 'automation',
    title: 'Automate release notes',
    content: body('Connect the changelog generator to auto-publish updates on every tag.'),
  },
];

export const onboardingSteps: AccordionItemType[] = [
  {
    key: 'create-project',
    title: 'Create a project',
    content: body('Spin up a workspace and invite your teammates.'),
  },
  {
    key: 'import-assets',
    title: 'Import assets',
    content: body('Upload icons, typography, and spacing tokens.'),
  },
];

export const statusItems: AccordionItemType[] = [
  {
    key: 'info',
    title: 'Informational',
    color: 'primary',
    content: body('Set `color` per item to accent its expanded panel.'),
  },
  {
    key: 'healthy',
    title: 'All systems healthy',
    color: 'success',
    content: body('The title and chevron pick up the color while open.'),
  },
  {
    key: 'review',
    title: 'Needs review',
    color: 'warning',
    content: body('Collapsed items stay neutral.'),
  },
  {
    key: 'failed',
    title: 'Build failed',
    color: 'error',
    content: body('Use error to emphasize failures.'),
  },
];

export const setupSteps: AccordionItemType[] = [
  {
    key: 'install',
    title: 'Install the package',
    content: body('Run `npm install @plocks/ui` in your workspace.'),
  },
  {
    key: 'provider',
    title: 'Wrap your app in providers',
    content: body('Add ThemeProvider, ToastProvider, and DialogProvider at the root.'),
  },
  {
    key: 'compose',
    title: 'Compose your first screen',
    content: body('Drop in fields, buttons, and feedback components from the library.'),
  },
];
```

### Multiple Expansion

Control the `expanded` keys to keep several accordion items open at the same time.

```tsx
import { useState } from 'react';
import { Accordion } from '@plocks/ui';
import { knowledgeBase } from '../data';

export function Demo() {
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['collaboration']);

  return (
    <Accordion
      type="multiple"
      expanded={expandedKeys}
      onExpandedChange={setExpandedKeys}
      items={knowledgeBase}
    />
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### Visual Variants

Switch between `default`, `separated`, and `bordered` variants to adjust emphasis.

```tsx
import { Accordion, Block, Text } from '@plocks/ui';
import { onboardingSteps } from '../data';

const variants = ['default', 'separated', 'bordered'] as const;

export function Demo() {
  return (
    <Block>
      {variants.map((variant) => (
        <Block key={variant}>
          <Text size="xs" fw="600" c="muted" tt="uppercase" lts={1}>
            {variant}
          </Text>
          <Accordion type="single" variant={variant} items={onboardingSteps} />
        </Block>
      ))}
    </Block>
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### Accent Colors

Accent each expanded panel with a theme palette — `primary`, `secondary`, `tertiary`, `success`, `warning`, `error`, or `gray`. Set `color` on the accordion for a uniform accent, or per item to mix accents in a single accordion. Collapsed items stay neutral so only the open panel is highlighted.

```tsx
import { Accordion } from '@plocks/ui';
import { statusItems } from '../data';

export function Demo() {
  return (
    <Accordion
      type="multiple"
      variant="separated"
      defaultExpanded={['healthy']}
      items={statusItems}
    />
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### Title customization

`titleProps` accepts any `<Text>` props (`ff`, `fw`, `lts`, `tt`, `size`, `c`, `style`) and applies them to every item header in the accordion. The existing `headerTextStyle` escape hatch still works and can be combined.

```tsx
import { Accordion } from '@plocks/ui';
import { setupSteps } from '../data';

export function Demo() {
  return (
    <Accordion
      items={setupSteps}
      titleProps={{ tt: 'uppercase', lts: 1, fw: '700', size: 'sm' }}
    />
  );
}
```

`data.ts` is the same file shown under “Basics” above.
