# Toast

The Toast component provides non-blocking notification messages that appear temporarily to give feedback about an operation or event. Title and body each accept full `<Text>` props via `titleProps` / `bodyProps` — also forwarded by every `useToast()` shortcut.

## Metadata

- Canonical name: `Toast`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Toast } from '@platform-blocks/react-ui-library';`
- Category: feedback
- Tags: toast, notification, alert, message, feedback
- Docs: https://react-ui-library.com/components/Toast
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Toast

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | ToastVariant | No | 'light' | Toast variant |
| `size` | ComponentSizeValue | No | 'md' | Size token controlling padding, typography, icon, and close-button scale. Accepts any of the seven component tokens (`xs`–`3xl`) or a number, which is read as the title font size and scales the rest proportionally. |
| `color` | ThemeColor | No | 'gray' | Toast color - can be theme color or custom color string |
| `severity` | ToastSeverity | No |  | Severity level — sets the color, the default icon, and the haptic played on appear. More than a color: prefer it over `color` for status toasts. |
| `title` | string | No |  | Toast title |
| `children` | React.ReactNode | No |  | Toast content |
| `icon` | React.ReactNode | No |  | Icon to display |
| `withCloseButton` | boolean | No | true | Whether to show close button |
| `loading` | boolean | No | false | Whether to show loading indicator |
| `closeButtonLabel` | string | No | 'Close notification' | Close button accessibility label |
| `onClose` | () => void | No |  | Callback when close button is pressed |
| `onExited` | () => void | No |  | Fired once the hide transition has finished playing. `ToastProvider` uses this to unmount a toast exactly when it finishes leaving instead of on a fixed timer, so a custom `transitionDuration` never gets cut short. |
| `visible` | boolean | No | false | Whether the toast is visible |
| `animationDuration` | number | No | 300 | Animation duration in ms |
| `transitionDuration` | number | No | 300 | Show/hide transition length in ms. Cross-component spelling that takes precedence over `animationDuration`; `0` shows and hides with no animation. |
| `autoHide` | number | No | 4000 | Auto hide duration in ms (0 to disable) |
| `paused` | boolean | No | false | Suspends the auto-hide countdown without resetting it; clearing it resumes with the time that was left. `ToastProvider` sets this for every toast in a stack while the pointer or keyboard focus is inside that stack. |
| `position` | ToastPosition | No | 'top' | Position of the toast for animation direction |
| `style` | StyleProp<ViewStyle> | No |  | Container style |
| `testID` | string | No |  | Test ID for testing |
| `actions` | ToastAction[] | No |  | Action buttons |
| `dismissOnTap` | boolean | No | false | Whether toast can be dismissed by tapping |
| `maxWidth` | number | No |  | Maximum width for toast |
| `persistent` | boolean | No | false | Persist toast until manually dismissed |
| `keepMounted` | boolean | No | true | Keep toast mounted in the tree when hidden |
| `animationConfig` | ToastAnimationConfig | No |  | Animation configuration |
| `swipeConfig` | ToastSwipeConfig | No |  | Swipe to dismiss configuration |
| `onSwipeDismiss` | () => void | No |  | Callback when toast is dismissed via swipe |
| `selectable` | boolean | No | false | Whether the toast text can be selected. Toasts are transient chrome that is usually swiped or tapped, so a press-and-hold that starts a selection reads as a glitch rather than an affordance. |
| `titleProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the title `<Text>` (style, weight, ff, size, color). |
| `bodyProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the body `<Text>` (the `children` content). |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |
| `radius` | RadiusValue | No |  | Border radius value - supports size tokens, numbers, and special values |

## Examples

### Basic Usage
ID: `Toast.basic` • Tags: toast, notifications • Category: basics • Status: stable • Since: 1.0.0

Call `toast.success` with a title, message, and optional `autoHide` value to show a standard confirmation toast.

```tsx
const toast = useToast();
  const handlePress = () => {
    toast.success({
      title: 'Success!',
      message: 'The operation finished without issues.',
      autoHide: 4000,
    });
  };
  return <Button onPress={handlePress}>Show success toast</Button>;
}
```

### Positions
ID: `Toast.positions` • Tags: toast, layout, placement • Category: layout • Status: stable • Since: 1.0.0

Set the `position` option to anchor the toast stack to any corner or edge of the viewport.

```tsx
const toastPositions = [
  'top-left',
  'top-center', 
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;
  const toast = useToast();
  const showToastAtPosition = (position: typeof toastPositions[number]) => {
    toast.show({
      title: `Toast at ${position}`,
      message: `This toast appears at ${position} position.`,
      position,
    });
  };
  return (
    <Block>
      <Text size="xs" color="secondary">
        Pass `position` to align the toast container with your layout.
      </Text>
      <Row gap="xs" wrap="wrap">
        {toastPositions.map((position) => (
          <Button key={position} size="sm" onPress={() => showToastAtPosition(position)}>
            {position}
          </Button>
        ))}
      </Row>
    </Block>
  );
}
```

### Visual Variants
ID: `Toast.visual-variants` • Tags: toast, variant, styling, filled, outline, light • Category: theming • Status: stable • Since: 1.0.0

Use the `variant` prop to control the toast surface: `filled` (solid color with auto-contrast text), `outline` (surface with a full colored border), or `light` (subtle surface with a colored left accent). Combine it with any `color` or severity helper.

```tsx
const VARIANTS = ['light', 'filled', 'outline'] as const;
type ToastVariant = (typeof VARIANTS)[number];
const COPY: Record<ToastVariant, string> = {
  light: 'Subtle surface with a colored left accent.',
  filled: 'Solid fill with auto-contrast text.',
  outline: 'Surface with a full colored border.',
};
  const toast = useToast();
  return (
    <Block gap="md">
      <Text size="xs" color="secondary">
        The `variant` prop controls the toast surface. Each preview below pairs
        the variant with the `success` severity — swap `severity` or `color` to
        recolor any of them.
      </Text>
      {VARIANTS.map((variant) => (
        <Block key={variant} gap="xs">
          <Text variant="small" color="secondary">
            {variant}
          </Text>
          <Toast
            visible
            persistent
            autoHide={0}
            variant={variant}
            severity="success"
            title="Changes saved"
            icon={<Icon name="success" variant="filled" />}
            withCloseButton={false}
          >
            {COPY[variant]}
          </Toast>
        </Block>
      ))}
      <Row gap="xs" wrap="wrap">
        {VARIANTS.map((variant) => (
          <Button
            key={variant}
            variant={variant === 'filled' ? 'filled' : 'outline'}
            onPress={() =>
              toast.success({
                variant,
                title: `${variant} toast`,
                message: COPY[variant],
              })
            }
          >
            Show {variant}
          </Button>
        ))}
      </Row>
    </Block>
  );
}
```

### Size Tokens
ID: `Toast.sizes` • Tags: toast, size, sizing, tokens • Category: appearance • Status: stable • Since: 1.0.0

The `size` prop supports the full seven-token scale (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`) and scales padding, title and body typography, the leading icon, action buttons, and the close button together. A number is read as the title font size and scales the rest proportionally. Set `defaultSize` on `ToastProvider` to change the default for every toast.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  const toast = useToast();
  return (
    <Block gap="md">
      <Text size="xs" color="secondary">
        `size` accepts all seven component tokens. Padding, title and body type,
        the leading icon, and the close button all scale together — pass a
        number instead of a token to scale from a custom title size. The
        previews are static; the buttons below fire real toasts at each size.
      </Text>
      {SIZES.map((size) => (
        <Block key={size} gap="xs">
          <Text variant="small" color="secondary">
            {size}
          </Text>
          <Toast
            visible
            persistent
            autoHide={0}
            size={size}
            variant="light"
            severity="info"
            title="Sync complete"
            icon={<Icon name="info" variant="filled" />}
            withCloseButton={false}
          >
            Everything is up to date.
          </Toast>
        </Block>
      ))}
      <Row gap="xs" wrap="wrap">
        {SIZES.map((size) => (
          <Button
            key={size}
            size="sm"
            variant="outline"
            onPress={() =>
              toast.info({
                size,
                title: `Size ${size}`,
                message: 'Toasts keep their proportions at every token.',
              })
            }
          >
            {size}
          </Button>
        ))}
      </Row>
    </Block>
  );
}
```

### Severity Helpers
ID: `Toast.variants` • Tags: toast, severity, styling • Category: theming • Status: stable • Since: 1.0.0

Use `toast.success`, `toast.warning`, `toast.error`, and `toast.info` to render consistent styling and icons for each severity.

```tsx
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
    <Block>
      <Text size="xs" color="secondary">
        Use the severity helpers to render consistent styling for each toast type.
      </Text>
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
    </Block>
  );
}
```

### Interactive Features
ID: `Toast.interactive` • Tags: toast, actions, persistence • Category: behavior • Status: stable • Since: 1.0.0

Add `actions`, toggle `persistent`, or shorten `autoHide` to tailor toast interactions for acknowledgements, warnings, and ephemeral notices.

```tsx
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
    let toastId = '';
    toastId = toast.show({
      title: 'Important notice',
      message: 'This toast stays visible until dismissed.',
      persistent: true,
      actions: [
        {
          label: 'Dismiss',
          onPress: () => toast.hide(toastId),
        },
      ],
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
ID: `Toast.stacking` • Tags: toast, stack, queue, limit • Category: behavior • Status: stable • Since: 1.1.0

Toasts at the same position form a stack. The newest one always takes the slot against the anchored edge and the rest move out of its way; when one is dismissed, the toasts behind it slide into the gap while it fades. Hovering — or tabbing into — any toast pauses the countdown on the whole stack, and resumes it with the time that was left. `limit` caps how many are on screen at once, retiring the oldest with its normal exit rather than deleting it.

```tsx
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
      <Button variant="outline" onPress={() => toast.hideAll()}>
        Dismiss all
      </Button>
      <Text size="xs" color="secondary">
        Hover the stack to hold every toast open.
      </Text>
    </Block>
  );
}
```

### Enhanced Features
ID: `Toast.enhanced` • Tags: toast, animations, batching • Category: advanced • Status: stable • Since: 1.0.0

Combine swipe gestures, custom `animationConfig`, batch helpers, and `toast.promise` to coordinate rich toast experiences.

```tsx
const toast = useToast();
  const [loading, setLoading] = useState(false);
  const showSwipeableToast = () => {
    toast.info({
      title: 'Swipe me!',
      message: 'Drag horizontally to dismiss this toast.',
      swipeConfig: {
        enabled: true,
        threshold: 150,
        direction: 'horizontal',
      },
      onSwipeDismiss: () => {
        console.log('Toast dismissed via swipe');
      },
      persistent: true,
    });
  };
  const showAnimatedToast = () => {
    toast.success({
      title: 'Spring motion',
      message: 'Bounce animation with custom spring physics.',
      animationConfig: {
        type: 'bounce',
        springConfig: {
          damping: 10,
          stiffness: 100,
        },
      },
    });
  };
  const showScaleToast = () => {
    toast.warning({
      title: 'Scale in',
      message: 'Combines scale animation with bidirectional swipe.',
      animationConfig: {
        type: 'scale',
        duration: 500,
      },
      swipeConfig: {
        enabled: true,
        direction: 'both',
      },
    });
  };
  const showToastWithActions = () => {
    toast.info({
      title: 'Actions',
      message: 'Toasts can render multiple CTA buttons.',
      actions: [
        {
          label: 'Retry',
          onPress: () => toast.success('Retrying…'),
        },
        {
          label: 'Cancel',
          onPress: () => toast.error('Cancelled'),
        },
      ],
      persistent: true,
    });
  };
  const showBatchToasts = () => {
    toast.batch([
      {
        title: 'Batch 1',
        message: 'First toast in batch',
        severity: 'info',
        groupId: 'batch-demo',
      },
      {
        title: 'Batch 2',
        message: 'Second toast in batch',
        severity: 'success',
        groupId: 'batch-demo',
      },
      {
        title: 'Batch 3',
        message: 'Third toast in batch',
        severity: 'warning',
        groupId: 'batch-demo',
      },
    ]);
  };
  const hideBatchToasts = () => {
    toast.hideGroup('batch-demo');
  };
  const showPromiseToast = async () => {
    setLoading(true);
    const mockApiCall = () =>
      new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            resolve('Success!');
          } else {
            reject('Failed!');
          }
        }, 2000);
      });
    try {
      await toast.promise(mockApiCall(), {
        pending: 'Loading data…',
        success: (data) => `Operation completed: ${data}`,
        error: (error) => `Operation failed: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Block>
      <Button onPress={showSwipeableToast}>Swipe to dismiss</Button>
      <Button variant="outline" onPress={showAnimatedToast}>
        Bounce animation
      </Button>
      <Button variant="outline" onPress={showScaleToast}>
        Scale animation + swipe
      </Button>
      <Button variant="outline" onPress={showToastWithActions}>
        Toast with actions
      </Button>
      <Button variant="outline" onPress={showBatchToasts}>
        Show batch toasts
      </Button>
      <Button variant="outline" onPress={hideBatchToasts}>
        Hide batch toasts
      </Button>
      <Button variant="outline" loading={loading} onPress={showPromiseToast}>
        Promise integration
      </Button>
      <Block>
        <Text size="xs" color="secondary">
          Tap-to-dismiss example:
        </Text>
        <Toast
          visible
          title="Tap me!"
          severity="info"
          dismissOnTap
          onClose={() => console.log('Tapped!')}
          position="bottom"
        >
          This toast can be dismissed by tapping.
        </Toast>
      </Block>
    </Block>
  );
}
```

### Text customization
ID: `Toast.text-customization` • Tags: titleProps, bodyProps, customization, slot-props • Category: general • Status: stable • Since: 1.0.0

`titleProps` and `bodyProps` accept any `<Text>` props (`ff`, `weight`, `size`, `color`, `style`…) and apply them to the toast title and body slots. Useful for matching toast typography to your brand.

```tsx
const toast = useToast();
  return (
    <Block>
      <Button
        onPress={() => {
          toast.show({
            title: 'Default styling',
            message: 'No custom title or body props.',
            severity: 'info',
            autoHide: 4000,
          });
        }}
      >
        Default toast
      </Button>
      <Button
        onPress={() => {
          toast.show({
            title: 'Bold uppercase title',
            message: 'Title rendered with monospace + tracking.',
            severity: 'success',
            autoHide: 4000,
            titleProps: {
              ff: 'monospace',
              weight: '700',
              uppercase: true,
              tracking: 1,
              size: 'sm',
            },
            bodyProps: { size: 'sm' },
          });
        }}
      >
        Tracked uppercase title
      </Button>
      <Button
        onPress={() => {
          toast.show({
            title: 'Brand serif title',
            message: 'Title in Georgia, body in default font.',
            severity: 'warning',
            autoHide: 4000,
            titleProps: { ff: 'Georgia, serif', size: 'lg' },
          });
        }}
      >
        Custom font on title
      </Button>
    </Block>
  );
}
```
