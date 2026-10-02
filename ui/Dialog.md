# Dialog

The Dialog component presents content above the app, supporting focus trapping, scroll locking, and multiple presentation styles (modal, confirmation, bottom sheet).

## Metadata

- Import: `import { Dialog } from '@plocks/ui';`
- Status: experimental
- Tags: modal, dialog, overlay, sheet
- Docs: https://plocks.dev/components/Dialog
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Dialog

## Props

- `opened`: boolean = false — Whether the dialog is shown.
- `variant`: 'modal' | 'bottomsheet' | 'fullscreen' = 'modal' — Presentation style of the dialog. @default 'modal'
- `title`: string | null — Title shown in the header; also the dialog's accessible name.
- `accessibilityLabel`: string — Accessible name when there is no `title`.
- `children` (required): ReactNode — Dialog body content.
- `closable`: boolean = true — Allows the user to close the dialog via the close button, Escape and Android back. @default true
- `backdrop`: boolean = true — Whether to render the dimming backdrop behind the dialog. @default true
- `backdropClosable`: boolean = true — Whether tapping the backdrop should close the dialog. @default true
- `shouldClose`: boolean = false — Triggers the close animation when set to true.
- `onClose`: () => void — Called when the dialog requests to close (after the exit transition).
- `w`: number — Optional explicit width for the dialog content (modal/bottomsheet).
- `h`: number — Optional explicit height for the dialog content.
- `radius`: number — Corner radius for the dialog container (bottom sheet rounds top corners only).
- `style`: StyleProp<ViewStyle> — Style overrides for the dialog body.
- `showHeader`: boolean = true — Whether to paint the header area with the dialog surface. @default true
- `bottomSheetSwipeZone`: 'container' | 'handle' | 'none' = 'container' — Controls which part of the bottom sheet responds to swipe-to-dismiss gestures
- `transitionDuration`: number = 300 — Length of the open/close transition in ms; the built-in timings scale against a 300ms baseline. `0` shows and dismisses the dialog instantly. Always 0 under reduced motion.
- `titleProps`: Omit<TextProps, 'children'> — Override props applied to the title `<Text>` (style, weight, ff, size, color).
- `closeButtonLabel`: string = 'Close dialog' — Accessible label of the close button. @default 'Close dialog'
- `autoFocus`: DialogAutoFocus = false — Where focus lands when the dialog opens. See {@link DialogAutoFocus}.
- `trapFocus`: boolean = true — Keep Tab focus cycling inside the dialog while it is open (web). Focus always returns to the previously focused element when it closes.
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { DialogProvider, DialogRenderer } from '@plocks/ui';`

`DialogProvider`, `DialogRenderer` have no props interface of their own.

## Related hooks

- `useDialog(): DialogContextValue` — Returns the nearest `DialogProvider`'s full dialog API — the open `dialogs` list plus `openDialog`, `closeDialog`, `removeDialog` and `closeAllDialogs` — and never throws: outside a provider it returns a global bridge that queues calls until one mounts.
- `useDialogApi()` — Returns just the dialog actions (`openDialog`, `closeDialog`, `removeDialog`, `closeAllDialogs`) of the nearest `DialogProvider` without subscribing to the dialog list, so opening a dialog doesn't re-render the caller; outside a provider it returns a bridge that queues calls until one mounts.
- `useDialogs()` — Returns the nearest `DialogProvider`'s open dialogs (`DialogConfig[]`, in the order they were opened) and re-renders when the list changes — for custom dialog renderers and "is anything open?" checks; outside a provider it returns a non-reactive snapshot (empty when none is mounted) instead of throwing.
- `useSimpleDialog()` — Returns one-call dialog helpers — `modal`, `bottomSheet`, `fullScreen` and `confirm` (each returns the new dialog's id) plus `close(id)` and `closeAll()` — for opening common dialogs without building a `DialogConfig`; like `useDialog()` it never throws, but a `DialogProvider` with a `DialogRenderer` inside must be mounted for anything to show.

## Types

```ts
export type DialogAutoFocus = boolean | RefObject<DialogFocusable | null>;

export interface DialogFocusable {
  focus?: () => void;
}
```

## Examples

### Basics

Call `openDialog` with `variant: 'modal'` to show a titled dialog and wire action buttons to `closeDialog` when the user makes a choice.

```tsx
import { Block, Button, Row, Text, useDialog } from '@plocks/ui';

export function Demo() {
  const { openDialog, closeDialog } = useDialog();

  const showBasicDialog = () => {
    const dialogId = openDialog({
      variant: 'modal',
      title: 'Basic Dialog',
      content: (
        <Block>
          <Text>This is a basic modal dialog with theme-aware styling.</Text>
          <Row gap="sm" justify="flex-end" mt="sm">
            <Button variant="secondary" onPress={() => closeDialog(dialogId)}>
              Cancel
            </Button>
            <Button variant="filled" onPress={() => closeDialog(dialogId)}>
              OK
            </Button>
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

Switch the dialog `variant` to `'bottomsheet'` to get swipe-to-dismiss behavior and retain full control with `closeDialog` handlers.

```tsx
import { Block, Button, Text, useDialog } from '@plocks/ui';

export function Demo() {
  const { openDialog, closeDialog } = useDialog();

  const showBottomSheetDialog = () => {
    const dialogId = openDialog({
      variant: 'bottomsheet',
      content: (
        <Block>
          <Text>This dialog slides up from the bottom with theme-aware styling.</Text>
          <Button variant="subtle" onPress={() => closeDialog(dialogId)}>
            Close
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

### Variants

Open the modal, bottom sheet, and fullscreen presentations to compare their placement and dismissal.

```tsx
import { Button, Row, Text, useDialog } from '@plocks/ui';

const variants = ['modal', 'bottomsheet', 'fullscreen'] as const;

export function Demo() {
  const { openDialog } = useDialog();
  return (
    <Row gap="sm" wrap="wrap">
      {variants.map(variant => (
        <Button key={variant} variant="light" onPress={() => openDialog({
          variant,
          title: `${variant} dialog`,
          content: <Text>Dialog content in the {variant} presentation.</Text>,
        })}>
          Open {variant}
        </Button>
      ))}
    </Row>
  );
}
```

### Confirmation

Pair `variant: 'modal'` with a destructive button (`color="error"`) to confirm irreversible actions before calling your business logic.

```tsx
import { Block, Button, Row, Text, useDialog } from '@plocks/ui';

export function Demo() {
  const { openDialog, closeDialog } = useDialog();

  const showConfirmationDialog = () => {
    const dialogId = openDialog({
      variant: 'modal',
      title: 'Confirm Action',
      content: (
        <Block>
          <Text>Are you sure you want to delete this item?</Text>
          <Text size="sm" c="secondary">
            This action cannot be undone.
          </Text>
          <Row gap="sm" justify="flex-end" mt="sm">
            <Button variant="subtle" onPress={() => closeDialog(dialogId)}>
              Cancel
            </Button>
            <Button variant="filled" color="error" onPress={() => closeDialog(dialogId)}>
              Delete
            </Button>
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

Embed inputs in the dialog `content`, collect values via controlled callbacks, and validate before resolving the promise or calling `closeDialog`.

```tsx
import { useRef } from 'react';
import { TextInput } from 'react-native';

import { Block, Button, Input, Row, useDialog } from '@plocks/ui';

export function Demo() {
  const { openDialog, closeDialog } = useDialog();
  const nameRef = useRef<TextInput>(null);

  const showFormDialog = () => {
    const formData = { name: '', email: '' };

    const dialogId = openDialog({
      variant: 'modal',
      title: 'Create Account',
      // Focus the name field once the open transition settles. `autoFocus: true`
      // picks the first focusable field automatically, but only on web — a ref
      // works on every platform.
      autoFocus: nameRef,
      content: (
        <Block>
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

          <Row gap="sm" justify="flex-end" mt="sm">
            <Button variant="secondary" onPress={() => closeDialog(dialogId)}>
              Cancel
            </Button>
            <Button
              variant="filled"
              onPress={() => {
                if (!formData.name || !formData.email) return;
                closeDialog(dialogId);
              }}
            >
              Create account
            </Button>
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

`titleProps` accepts any `<Text>` props (`ff`, `fw`, `lts`, `tt`, `size`, `c`, `style`) and applies them to the dialog header without changing the rest of the chrome. The same prop is also accepted by `openDialog({ titleProps })` for imperative dialogs.

```tsx
import { Block, Button, Text, useDialog, type DialogConfig } from '@plocks/ui';

export function Demo() {
  const { openDialog } = useDialog();

  const open = (titleProps: DialogConfig['titleProps']) => {
    openDialog({
      variant: 'modal',
      title: 'Welcome aboard',
      titleProps,
      content: <Text>Dialog title styled via `titleProps`.</Text>,
    });
  };

  return (
    <Block>
      <Button onPress={() => open(undefined)}>Default</Button>
      <Button
        onPress={() =>
          open({
            tt: 'uppercase',
            lts: 1.5,
            fw: '700',
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
            fw: '600',
          })
        }
      >
        Serif headline
      </Button>
      <Button
        onPress={() =>
          open({
            c: 'primary',
            fw: '700',
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
