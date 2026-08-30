# useTitleRegistration

Register headings with the shared title registry so sticky TOCs and scrollspy hooks stay in sync.

## Metadata

- Canonical name: `useTitleRegistration`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useTitleRegistration } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: navigation
- Tags: toc, titles
- Docs: https://react-ui-library.com/hooks/useTitleRegistration
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useTitleRegistration

## Definition

```ts
export interface UseTitleRegistrationOptions {
  /** Text content of the title */
  text: string;
  /** Order for sorting titles, lower numbers appear first */
  order: number;
  /** Optional ID, if not provided it will be generated from text */
  id?: string;
  /** Whether to automatically register/unregister the title */
  autoRegister?: boolean;
}

export const useTitleRegistration = (options: UseTitleRegistrationOptions);
```

## Examples

### Register headings

Use the title registry provider to keep downstream navigation components aware of rendered headings.

```tsx
import { View } from 'react-native';
import { Block, DataList, Text, TitleRegistryProvider, useTitleRegistration, useTitleRegistry } from '@platform-blocks/react-ui-library';

const SECTIONS = [
  { title: 'Why it matters', order: 1, description: 'Explain how the registry keeps navigation UI in sync with content.' },
  { title: 'When to use it', order: 2, description: 'Wrap large content layouts so scrollspy and tables of contents stay accurate.' },
  { title: 'Implementation tips', order: 3, description: 'Call the hook in section components and pass refs to headings that render in the DOM.' }
] as const;

function Section({ title, order, description }: { title: string; order: number; description: string }) {
  const { elementRef, id } = useTitleRegistration({ text: title, order });

  return (
    <View ref={elementRef} nativeID={id}>
      <Text weight="semibold">{title}</Text>
      <Text size="sm" color="secondary">{description}</Text>
    </View>
  );
}

function RegistryPreview() {
  const { titles } = useTitleRegistry();

  if (!titles.length) {
    return <Text size="sm" color="muted">No titles registered yet.</Text>;
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
          <Text size="sm" weight="semibold">Registered titles</Text>
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
