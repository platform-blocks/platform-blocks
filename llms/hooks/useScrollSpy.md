# useScrollSpy

Collect headings from the DOM or title registry and track which section is currently visible.

## Metadata

- Canonical name: `useScrollSpy`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useScrollSpy } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: navigation
- Tags: toc, navigation
- Docs: https://react-ui-library.com/hooks/useScrollSpy
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useScrollSpy

## Definition

```ts
export interface ScrollSpyOptions {
  /** CSS selector for the headings to track */
  selector?: string;
  /** Margin around the root element */
  rootMargin?: string;
  /** Container to search for headings */
  container?: string | HTMLElement;
  /** Function to get heading depth, defaults to h1=1, h2=2, etc. */
  getDepth?: (el: Element) => number;
  /** Function to get text value from element, defaults to textContent */
  getValue?: (el: Element) => string;
  /** Function to get ID from element, defaults to element ID or generated from text */
  getId?: (el: Element) => string;
  /** Disable automatic active ID updates from scroll events */
  disableAutoUpdate?: boolean;
}

export interface TocItem {
  /** Unique identifier for the heading */
  id: string;
  /** Text content of the heading */
  value: string;
  /** Heading depth, e.g. 1 for h1, 2 for h2, etc. */
  depth: number;
  /** Function to get the underlying DOM node, if available */
  getNode?: () => HTMLElement | null;
}

export interface UseScrollSpyReturn {
  /** Collected heading items */
  items: TocItem[];
  /** Currently active heading ID, or null if none */
  activeId: string | null;
  /** Set the active ID programmatically */
  setActiveId: (id: string | null) => void;
  /** Re-collect headings and re-initialize the observer */
  reinitialize: () => void;
}

export function useScrollSpy(options?: ScrollSpyOptions, initialData: TocItem[] = []): UseScrollSpyReturn;
```

## Examples

### Table of contents

Use the title registry to power a live-updating table of contents that highlights the section currently in view.

```tsx
import { ScrollView, View } from 'react-native';
import { Badge, Block, Row, Text, TitleRegistryProvider, useScrollSpy, useTitleRegistration } from '@platform-blocks/react-ui-library';

const SECTIONS = [
  { title: 'Overview', order: 1, copy: 'Introduce the feature and set expectations for what the rest of the document covers.' },
  { title: 'Installation', order: 2, copy: 'List required packages and platform caveats so teams can get started quickly.' },
  { title: 'Usage patterns', order: 3, copy: 'Highlight the most common ways to use the feature with short inline examples.' },
  { title: 'Troubleshooting', order: 4, copy: 'Capture the top issues support sees and the fix steps that usually resolve them.' }
] as const;

function Section({ title, order, copy }: { title: string; order: number; copy: string }) {
  const { elementRef, id } = useTitleRegistration({ text: title, order });

  return (
    <View ref={elementRef} nativeID={id}>
      <Text weight="semibold">{title}</Text>
      <Text size="sm" color="secondary">{copy}</Text>
    </View>
  );
}

function TocList() {
  const { items, activeId } = useScrollSpy();

  if (!items.length) {
    return <Text size="sm" color="muted">No headings detected yet.</Text>;
  }

  return (
    <Row gap="xs" wrap="wrap">
      {items.map(item => (
        <Badge
          key={item.id}
          variant={activeId === item.id ? 'light' : 'outline'}
          color={activeId === item.id ? 'primary' : 'gray'}
        >
          {item.value}
        </Badge>
      ))}
    </Row>
  );
}

export function Demo() {
  return (
    <TitleRegistryProvider>
      <Block gap="lg">
        <TocList />
        <ScrollView style={{ maxHeight: 280 }} contentContainerStyle={{ gap: 24 }}>
          {SECTIONS.map(section => (
            <Section key={section.title} {...section} />
          ))}
        </ScrollView>
      </Block>
    </TitleRegistryProvider>
  );
}
```
