# useTitleRegistration

Register headings with the shared title registry so sticky TOCs and scrollspy hooks stay in sync. To read the registry (`titles`, `registerTitle`, `unregisterTitle`, `clearTitles`) directly, call `useTitleRegistry()`, which throws outside a `TitleRegistryProvider`, or `useTitleRegistryOptional()`, which returns `null` there.

## Metadata

- Import: `import { useTitleRegistration } from '@plocks/ui';`
- Tags: toc, titles
- Docs: https://plocks.dev/hooks/useTitleRegistration
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/hooks/useTitleRegistration/index.ts

## Definition

```ts
export interface UseTitleRegistrationOptions {
  /** Text content of the title */
  text: string;
  /** Heading level (1–6); titles appear in page order */
  order: number;
  /** Optional ID, if not provided it will be generated from text */
  id?: string;
  /** Whether to automatically register/unregister the title */
  autoRegister?: boolean;
}

export interface UseTitleRegistrationReturn<T = View> {
  /** Attach to the heading's host element (the table of contents scrolls to it on web). */
  elementRef: RefObject<T | null>;
  /** The registry id: `options.id`, or a slug of `text`. */
  id: string;
}

export function useTitleRegistration<T = View>(options: UseTitleRegistrationOptions): UseTitleRegistrationReturn<T>;
```

## Examples

### Register headings

Use the title registry provider to keep downstream navigation components aware of rendered headings.

```tsx
import { View } from 'react-native';
import { Block, DataList, Text, TitleRegistryProvider, useTitleRegistration, useTitleRegistry } from '@plocks/ui';

const SECTIONS = [
  { title: 'Why it matters', order: 1, description: 'Explain how the registry keeps navigation UI in sync with content.' },
  { title: 'When to use it', order: 2, description: 'Wrap large content layouts so scrollspy and tables of contents stay accurate.' },
  { title: 'Implementation tips', order: 3, description: 'Call the hook in section components and pass refs to headings that render in the DOM.' }
] as const;

function Section({ title, order, description }: { title: string; order: number; description: string }) {
  const { elementRef, id } = useTitleRegistration({ text: title, order });

  return (
    <View ref={elementRef} nativeID={id}>
      <Text fw="semibold">{title}</Text>
      <Text size="sm" c="secondary">{description}</Text>
    </View>
  );
}

function RegistryPreview() {
  const { titles } = useTitleRegistry();

  if (!titles.length) {
    return <Text size="sm" c="muted">No titles registered yet.</Text>;
  }

  return (
    <DataList
      labelWidth={180}
      data={titles.map(title => ({ label: title.text, value: `level ${title.order}` }))}
    />
  );
}

export function Demo() {
  return (
    <TitleRegistryProvider>
      <Block gap="lg">
        <Block gap="xs">
          <Text size="sm" fw="semibold">Registered titles</Text>
          <RegistryPreview />
        </Block>
        <Block gap="lg">
          {SECTIONS.map(section => (
            <Section key={section.title} {...section} />
          ))}
        </Block>
      </Block>
    </TitleRegistryProvider>
  );
}
```
