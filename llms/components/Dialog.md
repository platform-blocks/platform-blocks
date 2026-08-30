# Dialog

The Dialog component presents content above the app, supporting focus trapping, scroll locking, and multiple presentation styles (modal, confirmation, bottom sheet).

## Metadata

- Canonical name: `Dialog`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Dialog } from '@platform-blocks/react-ui-library';`
- Status: experimental
- Category: overlay
- Tags: modal, dialog, overlay, sheet
- Docs: https://react-ui-library.com/components/Dialog
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Dialog

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `visible` | boolean | Yes |  | Controls whether the dialog is visible. |
| `variant` | 'modal' \| 'bottomsheet' \| 'fullscreen' | No |  | Presentation style of the dialog. |
| `title` | string \| null | No |  | Optional title text shown in the header area. |
| `children` | ReactNode | Yes |  | Dialog body content. |
| `closable` | boolean | No |  | Allows the user to close the dialog via UI controls or escape/back. |
| `backdrop` | boolean | No |  | Whether to render the dimming backdrop behind the dialog. |
| `backdropClosable` | boolean | No |  | Whether tapping the backdrop should close the dialog. |
| `shouldClose` | boolean | No |  | Triggers close animation when set to true. |
| `onClose` | () => void | No |  | Called when the dialog requests to close. |
| `w` | number | No |  | Optional explicit width for the dialog content (modal/bottomsheet). |
| `h` | number | No |  | Optional explicit height for the dialog content. |
| `radius` | number | No |  | Corner radius for the dialog container (bottom sheet rounds top corners only). |
| `style` | object | No |  | Optional style overrides for the dialog container. |
| `showHeader` | boolean | No |  | Whether to show the styled header area with background and border (default true). |
| `bottomSheetSwipeZone` | 'container' \| 'handle' \| 'none' | No |  | Controls which part of the bottom sheet responds to swipe-to-dismiss gestures |
| `transitionDuration` | number | No | 300 | Length of the open/close transition in ms; the built-in timings scale against a 300ms baseline. `0` shows and dismisses the dialog instantly. Always 0 under reduced motion. |
| `titleProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the title `<Text>` (style, weight, ff, size, color). |
| `autoFocus` | DialogAutoFocus | No | false | Moves focus into the dialog once it has finished opening. See {@link DialogAutoFocus}. |
| `trapFocus` | boolean | No | true | Keeps Tab focus cycling inside the dialog while it is open and restores focus to the previously focused element when it closes. Web only. |

## Examples

### Basic Modal
ID: `Dialog.basic` • Tags: dialog, modal, actions • Category: basics • Status: stable • Since: 1.0.0

Call `openDialog` with `variant: 'modal'` to show a titled dialog and wire action buttons to `closeDialog` when the user makes a choice.

```tsx
const { openDialog, closeDialog } = useDialog();
  const showBasicDialog = () => {
    const dialogId = openDialog({
      variant: 'modal',
      title: 'Basic Dialog',
      content: (
        <Block p="md">
          <Text>This is a basic modal dialog with theme-aware styling.</Text>
          <Text size="sm" color="secondary">
            Works in both light and dark mode.
          </Text>
          <Row gap="sm" mt="sm">
            <Block grow={1}>
              <Button fullWidth variant="secondary" onPress={() => closeDialog(dialogId)}>
                Cancel
              </Button>
            </Block>
            <Block grow={1}>
              <Button
                fullWidth
                onPress={() => {
                  console.log('OK button pressed!');
                  closeDialog(dialogId);
                }}
                variant="filled"
              >
                OK
              </Button>
            </Block>
          </Row>
        </Block>
      )
    });
  };
  return (
    <Button onPress={showBasicDialog}>Open Basic Dialog</Button>
  );
}
```

### Bottom Sheet
ID: `Dialog.bottomsheet` • Tags: dialog, bottomsheet, gestures • Category: variants • Status: stable • Since: 1.0.0

Switch the dialog `variant` to `'bottomsheet'` to get swipe-to-dismiss behavior and retain full control with `closeDialog` handlers.

```tsx
const { openDialog, closeDialog } = useDialog();
  const showBottomSheetDialog = () => {
    const dialogId = openDialog({
      variant: 'bottomsheet',
      content: (
        <Block>
          <Text>This dialog slides up from the bottom with theme-aware styling.</Text>
          <Block>
            <Text size="sm" color="secondary">
              Drag the handle or surface to move it.
            </Text>
            <Text size="sm" color="secondary">
              Swipe down to dismiss with velocity thresholds.
            </Text>
            <Text size="sm" color="secondary">
              Rubber-band resistance keeps the sheet anchored.
            </Text>
          </Block>
          <Input placeholder="Try typing while dragging..." />
          <Button variant="subtle" onPress={() => closeDialog(dialogId)}>
            Close programmatically
          </Button>
        </Block>
      )
    });
  };
  return (
    <Button onPress={showBottomSheetDialog}>Open Bottom Sheet</Button>
  );
}
```

### Confirmation
ID: `Dialog.confirmation` • Tags: dialog, confirmation, destructive • Category: patterns • Status: stable • Since: 1.0.0

Pair `variant: 'modal'` with a destructive button (`color="error"`) to confirm irreversible actions before calling your business logic.

```tsx
const { openDialog, closeDialog } = useDialog();
  const showConfirmationDialog = () => {
    const dialogId = openDialog({
      variant: 'modal',
      title: 'Confirm Action',
      content: (
        <Block p="md">
          <Text>Are you sure you want to delete this item?</Text>
          <Text size="sm" color="secondary">
            This action cannot be undone.
          </Text>
          <Row gap="sm" mt="sm">
            <Block grow={1}>
              <Button fullWidth variant="subtle" onPress={() => closeDialog(dialogId)}>
                Cancel
              </Button>
            </Block>
            <Block grow={1}>
              <Button
                fullWidth
                variant="filled"
                color="error"
                onPress={() => {
                  console.log('Item has been deleted');
                  closeDialog(dialogId);
                }}
              >
                Delete
              </Button>
            </Block>
          </Row>
        </Block>
      )
    });
  };
  return (
    <Button onPress={showConfirmationDialog}>Show Confirmation</Button>
  );
}
```

### Form Dialog
ID: `Dialog.form` • Tags: dialog, forms, validation • Category: patterns • Status: stable • Since: 1.0.0

Embed inputs in the dialog `content`, collect values via controlled callbacks, and validate before resolving the promise or calling `closeDialog`.

```tsx
const { openDialog, closeDialog } = useDialog();
  const nameRef = useRef<TextInput>(null);
  const showFormDialog = () => {
    let formData = { name: '', email: '' };
    const dialogId = openDialog({
      variant: 'modal',
      title: 'Create Account',
      // Focus the name field once the open transition settles. `autoFocus: true`
      // picks the first focusable field automatically, but only on web — a ref
      // works on every platform.
      autoFocus: nameRef,
      content: (
        <Block p="md">
          <Text size="sm" color="secondary">
            Fill in your details to create an account.
          </Text>
          <Input
            inputRef={nameRef}
            placeholder="Your name"
            label="Name"
            onChangeText={(text) => {
              formData.name = text;
            }}
          />
          <Input
            placeholder="your@email.com"
            label="Email"
            keyboardType="email-address"
            onChangeText={(text) => {
              formData.email = text;
            }}
          />
          <Row gap="sm" mt="sm">
            <Block grow={1}>
              <Button fullWidth variant="secondary" onPress={() => closeDialog(dialogId)}>
                Cancel
              </Button>
            </Block>
            <Block grow={1}>
              <Button
                fullWidth
                onPress={() => {
                  if (!formData.name || !formData.email) {
                    Alert.alert('Error', 'Please fill in all fields');
                    return;
                  }
                  Alert.alert('Success', `Account created for ${formData.name}`);
                  closeDialog(dialogId);
                }}
                variant="filled"
              >
                Create account
              </Button>
            </Block>
          </Row>
        </Block>
      )
    });
  };
  return (
    <Button onPress={showFormDialog}>Open Form Dialog</Button>
  );
}
```

### Title customization
ID: `Dialog.title-customization` • Tags: titleProps, customization, slot-props • Category: general • Status: stable • Since: 1.0.0

`titleProps` accepts any `<Text>` props (`ff`, `weight`, `tracking`, `uppercase`, `size`, `color`, `style`) and applies them to the dialog header without changing the rest of the chrome. The same prop is also accepted by `openDialog({ titleProps })` for imperative dialogs.

```tsx
const { openDialog, closeDialog } = useDialog();
  const open = (titleProps: any) => {
    const id = openDialog({
      variant: 'modal',
      title: 'Welcome aboard',
      titleProps,
      content: (
        <Block p="md">
          <Text>Dialog title styled via `titleProps`.</Text>
          <Button onPress={() => closeDialog(id)}>Close</Button>
        </Block>
      ),
    });
  };
  return (
    <Block>
      <Button onPress={() => open(undefined)}>Default</Button>
      <Button
        onPress={() =>
          open({
            uppercase: true,
            tracking: 1.5,
            weight: '700',
            size: 'sm',
          })
        }
      >
        Uppercase tracked
      </Button>
      <Button
        onPress={() =>
          open({
            ff: 'Georgia, serif',
            size: 'xl',
            weight: '600',
          })
        }
      >
        Serif headline
      </Button>
      <Button
        onPress={() =>
          open({
            color: 'primary',
            weight: '700',
            ff: 'monospace',
          })
        }
      >
        Brand-coloured monospace
      </Button>
    </Block>
  );
}
```
