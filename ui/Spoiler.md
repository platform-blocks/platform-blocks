# Spoiler

Spoiler collapses long content behind a show or hide control.

## Metadata

- Import: `import { Spoiler } from '@plocks/ui';`
- Docs: https://plocks.dev/components/Spoiler
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Spoiler

## Props

- `children` (required): React.ReactNode — Content to hide/show
- `mah`: number = 120 — Height in px the content collapses to — the content's, not the root's. @default 120
- `expanded`: boolean — Controlled expanded state. Pair with `onExpandedChange`.
- `defaultExpanded`: boolean = false — Initial expanded state when uncontrolled. @default false
- `onExpandedChange`: (expanded: boolean) => void — Called with the requested expanded state whenever the control is pressed.
- `showLabel`: string — Label for show more
- `hideLabel`: string — Label for hide
- `transitionDuration`: number = 180 — Transition duration ms (`0` — or reduced motion — disables the transition). @default 180
- `size`: SizeValue — Size token for the show/hide control font size
- `disabled`: boolean — Disable toggle
- `renderControl`: (args: SpoilerControlArgs) => React.ReactNode — Render custom control (it is wrapped in the toggle button, so render no pressable of your own)
- `transparentFade`: boolean — If true (default) fade bottom of clamped content to transparent using CSS mask on web
- `fadeColor`: string — Fallback overlay gradient end color (used only when transparentFade=false)
- `disableFadeAnimation`: boolean — Disable gradient fade animation (debug / perf). Default false (animation enabled).
- `controlProps`: Omit<TextProps, 'children'> — Override props applied to the show/hide control `<Text>` (style, weight, ff, size, color).
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface SpoilerControlArgs {
  /** Whether the content is currently expanded. */
  expanded: boolean;
  toggle: () => void;
  showLabel: string;
  hideLabel: string;
}
```

## Examples

### Basics

Set `mah` to reveal a preview of long copy while the rest stays accessible behind the built-in toggle.

```tsx
import { Block, Spoiler, Text } from '@plocks/ui';

const paragraphs = [
  'Spoilers collapse long sections of copy while keeping the content accessible to screen readers and keyboard users.',
  'Use them for optional detail or secondary information that might distract from a primary task. They expand inline, so the surrounding layout stays stable.',
  'They suit release notes, FAQ answers, long product descriptions, and legal terms: copy that most readers skim past but that some readers need to see in full before they make a decision.',
];

export function Demo() {
  return (
    <Block fullWidth>
      <Spoiler mah={96}>
        <Block>
          {paragraphs.map((paragraph) => (
            <Text key={paragraph}>{paragraph}</Text>
          ))}
        </Block>
      </Spoiler>
    </Block>
  );
}
```

### Initial State

Flip the `defaultExpanded` prop to choose whether content renders expanded on mount or waits for user interaction.

```tsx
import { Block, Spoiler, Text } from '@plocks/ui';

const content =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="small" c="secondary">Initially open</Text>
        <Spoiler mah={48} defaultExpanded>
          <Text>{content}</Text>
        </Spoiler>
      </Block>
      <Block>
        <Text variant="small" c="secondary">Initially closed</Text>
        <Spoiler mah={48}>
          <Text>{content}</Text>
        </Spoiler>
      </Block>
    </Block>
  );
}
```

### Max Heights

Dial the `mah` value up or down to control how much content stays visible before the toggle appears.

```tsx
import { Block, Spoiler, Text } from '@plocks/ui';

const paragraphs = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
];

const MAX_HEIGHTS = [60, 100, 150];

export function Demo() {
  return (
    <Block fullWidth>
      {MAX_HEIGHTS.map((maxHeight) => (
        <Block key={maxHeight}>
          <Text variant="small" c="secondary">{maxHeight}px</Text>
          <Spoiler mah={maxHeight}>
            <Block>
              {paragraphs.map((paragraph) => (
                <Text key={paragraph}>{paragraph}</Text>
              ))}
            </Block>
          </Spoiler>
        </Block>
      ))}
    </Block>
  );
}
```

### Custom Control

Use the `renderControl` callback alongside `expanded` and `onExpandedChange` to drive expansion with your own button or analytics hooks.

```tsx
import { useState } from 'react';

import { Block, Icon, Spoiler, Text } from '@plocks/ui';

export function Demo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Block fullWidth>
      <Spoiler
        mah={40}
        expanded={isOpen}
        onExpandedChange={setIsOpen}
        // The control is already a button (with aria-expanded): render its
        // content only, not another pressable.
        renderControl={({ expanded }) => (
          <Block direction="row" align="center" gap="xs">
            <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={14} />
            <Text size="sm" fw="600" c="primary">
              {expanded ? 'Collapse content' : 'Expand content'}
            </Text>
          </Block>
        )}
      >
        <Block>
          <Text size="sm">Open state: {String(isOpen)}</Text>
          <Text size="sm">You can render any React node as the control.</Text>
          <Text size="sm">
            Because the component is controlled, you can track expansion analytics or sync other UI elements when content is revealed.
          </Text>
        </Block>
      </Spoiler>
    </Block>
  );
}
```

### Control customization

`controlProps` accepts any `<Text>` props (`ff`, `fw`, `lts`, `tt`, `size`, `c`) and applies them to the show/hide control text — useful when the rest of your design system uses a particular weight or tracking style.

```tsx
import { Block, Spoiler, Text } from '@plocks/ui';

const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text size="sm" c="muted">Default control</Text>
        <Spoiler mah={60}>
          <Text>{longText}</Text>
        </Spoiler>
      </Block>

      <Block>
        <Text size="sm" c="muted">
          Uppercase tracked control
        </Text>
        <Spoiler
          mah={60}
          controlProps={{ tt: 'uppercase', lts: 1.5, fw: '700', size: 'xs' }}
        >
          <Text>{longText}</Text>
        </Spoiler>
      </Block>

      <Block>
        <Text size="sm" c="muted">
          Monospace control
        </Text>
        <Spoiler mah={60} controlProps={{ ff: 'monospace', fw: '600' }}>
          <Text>{longText}</Text>
        </Spoiler>
      </Block>
    </Block>
  );
}
```

### Newspaper

Combine imagery with long-form copy to mimic a newspaper-style reveal where the reader can expand to see the full story.

```tsx
import { Block, Spoiler, Text } from '@plocks/ui';
import { Image, Platform, View } from 'react-native';

const paragraphs = [
  'The coastal morning edition arrived with stories about record tides and neighborhoods working together to reinforce their seawalls. Photographers captured gulls darting between the waves as volunteers stacked sandbags along the promenade.',
  'Hidden inside the fold was a feature about an amateur archivist who discovered a crate of glass negatives documenting life on the waterfront a century ago. Each plate is being digitized so classrooms can study the evolution of the shoreline.',
  'City gardeners are also experimenting with hardy dune grasses to keep wind-swept sand in place during the colder months. The pilot plots stretch for blocks and bring a warm beige tone to an otherwise grey season.',
];

export function Demo() {
  const isWeb = Platform.OS === 'web';

  return (
    <Block fullWidth>
      <Spoiler mah={isWeb ? 220 : 260}>
        <View style={{ flexDirection: isWeb ? 'row' : 'column' }}>
          <Image
            source={require('../../../../assets/images/scene-ocean.png')}
            style={{ width: 180, height: 180, borderRadius: 12, marginRight: isWeb ? 16 : 0, marginBottom: isWeb ? 0 : 12 }}
          />
          <View style={{ flex: 1, marginTop: isWeb ? 0 : 8 }}>
            {paragraphs.map((paragraph) => (
              <Text key={paragraph} size="lg" style={{ marginBottom: 12 }}>
                {paragraph}
              </Text>
            ))}
          </View>
        </View>
      </Spoiler>
    </Block>
  );
}
```
