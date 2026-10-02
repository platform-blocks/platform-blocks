# Toast

Toast displays a temporary notification about an action or event.

## Metadata

- Import: `import { Toast } from '@plocks/ui';`
- Tags: toast, notification, alert, message, feedback
- Docs: https://plocks.dev/components/Toast
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Toast

## Props

- `variant`: 'light' | 'filled' | 'outline' = 'light' — Toast variant
- `size`: ComponentSizeValue = 'md' — Size token controlling padding, typography, icon, and close-button scale. Accepts any of the seven component tokens (`xs`–`3xl`) or a number, which is read as the title font size and scales the rest proportionally.
- `color`: ThemeColor = 'gray' — Toast color - can be theme color or custom color string
- `severity`: 'info' | 'success' | 'warning' | 'error' — Severity level — sets the color, the default icon, and the haptic played on appear. More than a color: prefer it over `color` for status toasts.
- `title`: string — Toast title
- `children`: React.ReactNode — Toast content
- `icon`: React.ReactNode — Icon to display
- `withCloseButton`: boolean = true — Whether to show close button
- `loading`: boolean = false — Whether to show loading indicator
- `closeButtonLabel`: string = 'Close notification' — Close button accessibility label
- `onClose`: () => void — Callback when close button is pressed
- `onExited`: () => void — Fired once the hide transition has finished playing. `ToastProvider` uses this to unmount a toast exactly when it finishes leaving instead of on a fixed timer, so a custom `transitionDuration` never gets cut short.
- `visible`: boolean = false — Whether the toast is visible
- `animationDuration`: number = 300 — Animation duration in ms
- `transitionDuration`: number = 300 — Show/hide transition length in ms. Cross-component spelling that takes precedence over `animationDuration`; `0` shows and hides with no animation.
- `autoHide`: number = 4000 — Auto hide duration in ms (0 to disable)
- `paused`: boolean = false — Suspends the auto-hide countdown without resetting it; clearing it resumes with the time that was left. `ToastProvider` sets this for every toast in a stack while the pointer or keyboard focus is inside that stack.
- `position`: 'top' | 'bottom' | 'left' | 'right' = 'top' — Edge the toast enters from (animation direction)
- `style`: StyleProp<ViewStyle> — Container style
- `testID`: string — Test ID for testing
- `actions`: ToastAction[] — Action buttons
- `dismissOnTap`: boolean = false — Whether toast can be dismissed by tapping
- `persistent`: boolean = false — Persist toast until manually dismissed
- `keepMounted`: boolean = true — Keep toast mounted in the tree when hidden
- `animationConfig`: ToastAnimationConfig — Animation configuration
- `swipeConfig`: ToastSwipeConfig — Swipe to dismiss configuration
- `onSwipeDismiss`: () => void — Callback when toast is dismissed via swipe
- `selectable`: boolean = false — Whether the toast text can be selected. Toasts are transient chrome that is usually swiped or tapped, so a press-and-hold that starts a selection reads as a glitch rather than an affordance.
- `titleProps`: Omit<TextProps, 'children'> — Override props applied to the title `<Text>` (style, fw, ff, size, c).
- `bodyProps`: Omit<TextProps, 'children'> — Override props applied to the body `<Text>` (the `children` content).
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), `radius`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { ToastProvider } from '@plocks/ui';`

### ToastProvider

- `children` (required): React.ReactNode
- `defaultPosition`: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center' — Default position for toasts
- `limit`: number — Maximum number of toasts per position
- `autoHide`: number — Default auto hide duration
- `defaultVariant`: 'light' | 'filled' | 'outline' — Default visual variant applied to toasts that don't specify their own
- `defaultSize`: ComponentSizeValue — Default size token applied to toasts that don't specify their own
- `offset`: ToastViewportOffset — Static viewport offset (px) reserved for app chrome. A dynamic offset published via `useToastViewportOffset` / `setToastViewportOffset` takes precedence per-axis when set.
- `queueOptions`: Partial<ToastQueueOptions> — Queue management options

## Related hooks

- `useToast()` — Returns the toast API (`show`, `update`, `hide`, `hideAll`, `promise`, `success` / `error` / `info` / `warning`, …) of the nearest `ToastProvider`; it never throws — outside a provider it returns the global `toasts` object, which queues calls until one mounts (use `useOptionalToast()` to get `null` instead).
- `useToastApi()` — Returns the same toast API as `useToast()` (an alias): the nearest `ToastProvider`'s `show` / `update` / `hide` / … methods, or the global `toasts` queue outside one — never throws.
- `useToastViewportOffset(offset: ToastViewportOffset)` — Publishes a viewport offset (`top` / `bottom` / `left` / `right`, in px) for every toast stack while the calling component is mounted — it works anywhere in the tree, no provider needed — and clears it on unmount, when the `ToastProvider`'s static `offset` applies again.
- `useOptionalToast(): ToastContextValue | null` — Returns the nearest `ToastProvider`'s toast API, or `null` when none is mounted — for components that show a toast only if the app has somewhere to render it (`useToast()` falls back to the global `toasts` queue instead).
- `useActiveToasts()` — Returns the toasts the nearest `ToastProvider` currently holds (as `ToastItem`s, including ones mid-exit with `visible: false`) and re-renders when that list changes — for counters, badges or a custom toast list; outside a provider it returns a non-reactive snapshot (empty when no provider is mounted) instead of throwing.

## Types

```ts
export interface ToastAction {
  label: string;
  onPress: () => void;
  color?: string;
}

export interface ToastAnimationConfig {
  type?: ToastAnimationType;
  duration?: number;
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
  /** Easing function (a reanimated `Easing`). */
  easing?: (value: number) => number;
}

export interface ToastSwipeConfig {
  enabled?: boolean;
  threshold?: number; // Distance to trigger dismiss
  direction?: 'horizontal' | 'vertical' | 'both';
  velocityThreshold?: number;
}

export interface ToastViewportOffset {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface ToastQueueOptions {
  /** Maximum number of visible toasts per position */
  maxVisible: number;
  /** How toasts stack when multiple are shown */
  stackDirection: ToastStackDirection;
  /** Space between stacked toasts */
  spacing: number;
  /** Queue processing priority */
  priority: ToastQueuePriority;
  /** Whether to allow duplicate toasts */
  allowDuplicates: boolean;
}
```

## Examples

### Basics

Call `toast.success` with a `title` and `message` to show a standard confirmation toast.

```tsx
import { Button, useToast } from '@plocks/ui';

export function Demo() {
  const toast = useToast();

  return (
    <Button
      onPress={() =>
        toast.success({
          title: 'Success!',
          message: 'The operation finished without issues.',
        })
      }
    >
      Show success toast
    </Button>
  );
}
```

### Positions

Set the `position` option to anchor the toast stack to any corner or edge of the viewport.

```tsx
import { Button, Row, useToast } from '@plocks/ui';

const toastPositions = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

export function Demo() {
  const toast = useToast();

  const showToastAtPosition = (position: typeof toastPositions[number]) => {
    toast.show({
      title: `Toast at ${position}`,
      message: `This toast appears at ${position} position.`,
      position,
    });
  };

  return (
    <Row gap="xs" wrap="wrap">
      {toastPositions.map((position) => (
        <Button key={position} size="sm" onPress={() => showToastAtPosition(position)}>
          {position}
        </Button>
      ))}
    </Row>
  );
}
```

### Visual Variants

Use the `variant` prop to control the toast surface: `filled` (solid color with auto-contrast text), `outline` (surface with a full colored border), or `light` (subtle surface with a colored left accent). Combine it with any `color` or severity helper.

```tsx
import { Block, Icon, Text, Toast } from '@plocks/ui';

const VARIANTS = ['light', 'filled', 'outline'] as const;

export function Demo() {
  return (
    <Block gap="md">
      {VARIANTS.map((variant) => (
        <Block key={variant} gap="xs">
          <Text variant="small" c="secondary">
            {variant}
          </Text>
          <Toast
            visible
            variant={variant}
            severity="success"
            title="Changes saved"
            icon={<Icon name="success" variant="filled" />}
            withCloseButton={false}
          >
            Your profile has been updated.
          </Toast>
        </Block>
      ))}
    </Block>
  );
}
```

### Size Tokens

The `size` prop supports the full seven-token scale (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`) and scales padding, title and body typography, the leading icon, action buttons, and the close button together. A number is read as the title font size and scales the rest proportionally. Set `defaultSize` on `ToastProvider` to change the default for every toast.

```tsx
import { Block, Icon, Text, Toast } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block gap="md">
      {SIZES.map((size) => (
        <Block key={size} gap="xs">
          <Text variant="small" c="secondary">
            {size}
          </Text>
          <Toast
            visible
            size={size}
            severity="info"
            title="Sync complete"
            icon={<Icon name="info" variant="filled" />}
            withCloseButton={false}
          >
            Everything is up to date.
          </Toast>
        </Block>
      ))}
    </Block>
  );
}
```

### Severity Helpers

Use `toast.success`, `toast.warning`, `toast.error`, and `toast.info` to render consistent styling and icons for each severity.

```tsx
import { Button, Row, useToast } from '@plocks/ui';

export function Demo() {
  const toast = useToast();

  const showSuccessToast = () => {
    toast.success({
      title: 'Success',
      message: 'The request completed correctly.',
    });
  };

  const showWarningToast = () => {
    toast.warning({
      title: 'Warning',
      message: 'Double-check the highlighted fields.',
    });
  };

  const showErrorToast = () => {
    toast.error({
      title: 'Error',
      message: 'Something went wrong.',
    });
  };

  const showInfoToast = () => {
    toast.info({
      title: 'Info',
      message: 'Here is some additional context.',
    });
  };

  return (
    <Row gap="xs" wrap="wrap">
      <Button onPress={showSuccessToast} variant="filled" color="success">
        Success
      </Button>
      <Button onPress={showWarningToast} variant="filled" color="warning">
        Warning
      </Button>
      <Button onPress={showErrorToast} variant="filled" color="error">
        Error
      </Button>
      <Button onPress={showInfoToast} variant="outline">
        Info
      </Button>
    </Row>
  );
}
```

### Interactive Features

Add `actions`, toggle `persistent`, or shorten `autoHide` to tailor toast interactions for acknowledgements, warnings, and ephemeral notices.

```tsx
import { Block, Button, useToast } from '@plocks/ui';

export function Demo() {
  const toast = useToast();

  const showActionToast = () => {
    toast.show({
      title: 'File uploaded',
      message: 'Your file has been uploaded successfully.',
      actions: [
        {
          label: 'Undo',
          onPress: () => toast.info('Upload reverted'),
        },
      ],
    });
  };

  const showPersistentToast = () => {
    toast.show({
      title: 'Important notice',
      message: 'This toast stays visible until dismissed.',
      persistent: true,
    });
  };

  const showTimedToast = () => {
    toast.show({
      title: 'Quick message',
      message: 'This one hides after two seconds.',
      autoHide: 2000,
    });
  };

  return (
    <Block>
      <Button onPress={showActionToast}>Toast with action</Button>
      <Button variant="outline" onPress={showPersistentToast}>
        Persistent toast
      </Button>
      <Button variant="outline" onPress={showTimedToast}>
        Quick toast (2s)
      </Button>
    </Block>
  );
}
```

### Stacking

Toasts at the same position form a stack. The newest one always takes the slot against the anchored edge and the rest move out of its way; when one is dismissed, the toasts behind it slide into the gap while it fades. Hovering — or tabbing into — any toast pauses the countdown on the whole stack, and resumes it with the time that was left. `limit` caps how many are on screen at once, retiring the oldest with its normal exit rather than deleting it.

```tsx
import { useRef } from 'react';

import { Block, Button, useToast } from '@plocks/ui';

export function Demo() {
  const toast = useToast();
  const counter = useRef(0);

  const push = () => {
    counter.current += 1;
    const n = counter.current;
    toast.show({
      title: `Message ${n}`,
      message: 'Dismiss one from the middle to watch the stack close the gap.',
      severity: (['info', 'success', 'warning', 'error'] as const)[n % 4],
      autoHide: 6000,
    });
  };

  const pushBurst = () => {
    toast.batch(
      Array.from({ length: 5 }, (_, index) => ({
        title: `Burst ${index + 1}`,
        message: 'Five at once — the limit retires the oldest.',
        severity: 'info' as const,
      }))
    );
  };

  return (
    <Block>
      <Button onPress={push}>Add a toast</Button>
      <Button variant="outline" onPress={pushBurst}>
        Add five at once
      </Button>
    </Block>
  );
}
```

### Enhanced Features

Combine swipe gestures, custom `animationConfig`, batch helpers, and `toast.promise` to coordinate rich toast experiences.

```tsx
import { Block, Button, useToast } from '@plocks/ui';

export function Demo() {
  const toast = useToast();

  const showSwipeableToast = () => {
    toast.info({
      title: 'Swipe me!',
      message: 'Drag in any direction to dismiss this toast.',
      swipeConfig: { direction: 'both', threshold: 150 },
    });
  };

  const showAnimatedToast = () => {
    toast.success({
      title: 'Spring motion',
      message: 'Bounce animation with custom spring physics.',
      animationConfig: {
        type: 'bounce',
        springConfig: { damping: 10, stiffness: 100 },
      },
    });
  };

  const showBatchToasts = () => {
    toast.batch([
      { title: 'Batch 1', message: 'First toast in batch', severity: 'info' },
      { title: 'Batch 2', message: 'Second toast in batch', severity: 'success' },
      { title: 'Batch 3', message: 'Third toast in batch', severity: 'warning' },
    ]);
  };

  const showPromiseToast = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      pending: 'Loading data…',
      success: 'Data loaded',
      error: 'Could not load data',
    });
  };

  return (
    <Block>
      <Button onPress={showSwipeableToast}>Swipe to dismiss</Button>
      <Button variant="outline" onPress={showAnimatedToast}>
        Bounce animation
      </Button>
      <Button variant="outline" onPress={showBatchToasts}>
        Show batch toasts
      </Button>
      <Button variant="outline" onPress={showPromiseToast}>
        Promise integration
      </Button>
    </Block>
  );
}
```

### Text customization

`titleProps` and `bodyProps` accept any `<Text>` props (`ff`, `fw`, `size`, `c`, `style`…) and apply them to the toast title and body slots. Useful for matching toast typography to your brand.

```tsx
import { Button, useToast } from '@plocks/ui';

export function Demo() {
  const toast = useToast();

  return (
    <Button
      onPress={() =>
        toast.show({
          title: 'Bold uppercase title',
          message: 'Title rendered with monospace + tracking.',
          severity: 'success',
          titleProps: {
            ff: 'monospace',
            fw: '700',
            tt: 'uppercase',
            lts: 1,
            size: 'sm',
          },
          bodyProps: { size: 'sm' },
        })
      }
    >
      Show custom toast
    </Button>
  );
}
```
