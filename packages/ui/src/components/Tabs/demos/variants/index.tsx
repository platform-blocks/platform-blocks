import type { ComponentProps } from 'react';
import { Block, Tabs, Text } from '@platform-blocks/react-ui-library';

type Variant = NonNullable<ComponentProps<typeof Tabs>['variant']>;

const VARIANT_DEMOS: Array<{
  heading: string;
  variant: Variant;
  helper: string;
  items: Array<{ key: string; label: string; description: string }>;
}> = [
  {
    heading: 'Line variant',
    variant: 'line',
    helper: 'Minimal underline style aligns with primary navigation patterns.',
    items: [
      { key: 'documents', label: 'Documents', description: 'Underline emphasizes the active document view.' },
      { key: 'images', label: 'Images', description: 'Great for media browsers with subtle hierarchy.' },
      { key: 'videos', label: 'Videos', description: 'Pairs well with narrow tab bars and dense content.' }
    ]
  },
  {
    heading: 'Chip variant',
    variant: 'chip',
    helper: 'Rounded pills feel tactile and work well for filters or secondary navigation.',
    items: [
      { key: 'overview', label: 'Overview', description: 'Pills highlight the selected state with a filled background.' },
      { key: 'details', label: 'Details', description: 'Suitable for segmented controls or inline filters.' },
      { key: 'settings', label: 'Settings', description: 'Works nicely for preference toggles.' }
    ]
  },
  {
    heading: 'Folder variant',
    variant: 'folder',
    helper: 'Raised folder styling evokes classic tabbed interfaces.',
    items: [
      { key: 'overview-folder', label: 'Overview', description: 'Ideal for dashboards with nested content.' },
      { key: 'details-folder', label: 'Details', description: 'Tabs feel like document dividers for data-heavy views.' },
      { key: 'settings-folder', label: 'Settings', description: 'Keeps controls organized in admin interfaces.' }
    ]
  }
];

export function Demo() {
  return (
    <Block>
      {VARIANT_DEMOS.map(({ heading, variant, helper, items }) => (
        <Block key={variant}>
          <Text weight="medium">{heading}</Text>
          <Tabs
            variant={variant}
            items={items.map(({ description, ...item }) => ({
              ...item,
              content: <Text>{description}</Text>
            }))}
          />
          <Text variant="small" color="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
