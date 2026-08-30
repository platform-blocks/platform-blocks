# LoadingOverlay

`LoadingOverlay` composits the core `Overlay` and `Loader` primitives to create a convenient helper for blocking interactions with a visual indicator during asynchronous operations. Render it inside a relatively positioned container, toggle `visible` during asynchronous work, and customize appearance by passing `overlayProps` or `loaderProps`.

## Metadata

- Canonical name: `LoadingOverlay`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { LoadingOverlay } from '@platform-blocks/react-ui-library';`
- Status: beta
- Category: feedback
- Docs: https://react-ui-library.com/components/LoadingOverlay
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/LoadingOverlay

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `visible` | boolean | No | false | Controls visibility of the loading overlay. |
| `zIndex` | number | No |  | z-index applied to the overlay container. Overrides value defined in overlayProps when provided. |
| `overlayProps` | OverlayProps | No |  | Props forwarded to the underlying Overlay component. |
| `loaderProps` | LoaderProps | No |  | Props forwarded to the Loader component. |
| `loader` | ReactNode | No |  | Custom loader content. When provided, Loader component is not rendered. |

## Examples

### Form blocking
ID: `LoadingOverlay.basic` • Tags: overlays, loading • Category: feedback • Status: stable • Since: 1.0.0

Locks a simple form while background work finishes and keeps the loader aligned with the card container.

```tsx
type TextFieldConfig = {
  key: string;
} & Pick<ComponentProps<typeof Input>, 'label' | 'placeholder' | 'keyboardType' | 'secureTextEntry'>;
const TEXT_FIELDS: TextFieldConfig[] = [
  { key: 'first-name', label: 'First name', placeholder: 'Jane' },
  { key: 'last-name', label: 'Last name', placeholder: 'Doe' },
  {
    key: 'email',
    label: 'Email',
    placeholder: 'jane@react-ui-library.com',
    keyboardType: 'email-address',
  },
  {
    key: 'password',
    label: 'Password',
    placeholder: '••••••••',
    secureTextEntry: true,
  },
];
  const [visible, setVisible] = useState(false);
  return (
    <Block align="center" style={styles.wrapper}>
      <Block style={styles.section}>
        <Card style={styles.card} shadow="lg">
          <LoadingOverlay
            visible={visible}
            overlayProps={{ blur: 12, radius: 'md', backgroundOpacity: 0.4 }}
            loaderProps={{ variant: 'dots', size: 'lg' }}
          />
          <Block>
            <Block>
              <Text variant="h4" weight="semibold">
                Account details
              </Text>
              <Text variant="p" color="muted">
                Pause form interaction while requests finish and keep the layout intact.
              </Text>
            </Block>
            <Block>
              {TEXT_FIELDS.map(({ key, ...field }) => (
                <Input key={key} disabled={visible} {...field} />
              ))}
              <Switch label="Subscribe to product updates" disabled={visible} />
            </Block>
          </Block>
        </Card>
        <Button onPress={() => setVisible((current) => !current)}>
          {visible ? 'Stop loading' : 'Simulate loading'}
        </Button>
      </Block>
      <Text variant="small" color="muted" align="center">
        LoadingOverlay anchors to a relative container and dims the content while the loader animates.
      </Text>
    </Block>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  section: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  card: {
    width: '100%',
  },
});
```
