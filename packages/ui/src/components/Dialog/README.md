# Dialog System

A unified dialog system for React Native with support for modals, bottom sheets, and full-screen overlays.

## Features

- **Three variants**: Modal, Bottom Sheet, and Full Screen
- **Consistent API**: Same props and behavior across all variants
- **Animations**: Smooth enter/exit animations with platform-optimized performance
- **Accessibility**: Full keyboard navigation, screen reader support, and focus management
- **Dismissal options**: Backdrop click, swipe gestures, escape key, and programmatic control
- **Nested dialogs**: Support for stacking multiple dialogs
- **Context-based**: Easy state management with React Context

## Basic Usage

### 1. Setup the Provider

Wrap your app with `DialogProvider` and add `DialogRenderer`:

```tsx
import { DialogProvider, DialogRenderer } from '@platform-blocks/react-ui-library';

function App() {
  return (
    <DialogProvider>
      <YourApp />
      <DialogRenderer />
    </DialogProvider>
  );
}
```

### 2. Use the Dialog Hook

```tsx
import { useDialog, Button, Text } from '@platform-blocks/react-ui-library';

function MyComponent() {
  const { openDialog } = useDialog();

  const handleOpen = () => {
    openDialog({
      variant: 'modal',
      title: 'Hello!',
      content: <Text>This is a modal dialog.</Text>
    });
  };

  return <Button title="Open Dialog" onPress={handleOpen} />;
}
```

## Dialog Variants

### Modal
Centers the dialog on screen with a backdrop. Perfect for confirmations and forms.

```tsx
openDialog({
  variant: 'modal',
  title: 'Confirm Action',
  content: <Text>Are you sure?</Text>,
  width: 400, // Optional custom width
  height: 300, // Optional custom height
});
```

**Features:**
- Centered positioning
- Backdrop with blur/dark overlay
- Rounded corners
- Scale animation
- Click outside to close
- Escape key to close

### Bottom Sheet
Slides up from the bottom of the screen. Great for mobile-first actions and menus.

```tsx
openDialog({
  variant: 'bottomsheet',
  title: 'Choose Action',
  content: (
    <View>
      <Button title="Option 1" onPress={() => {}} />
      <Button title="Option 2" onPress={() => {}} />
    </View>
  ),
});
```

**Features:**
- Slides from bottom with spring animation
- Rounded top corners for modern look
- Prominent drag handle for gesture affordance
- **Enhanced gesture support:**
  - Swipe down anywhere on the sheet to dismiss
  - Smart velocity detection for quick flicks
  - Rubber band effect when dragging
  - Dismissal threshold at 1/3 screen height
  - Smooth snap-back animation if not dismissed
  - Interrupted gesture handling
- Native mobile feel optimized for touch interfaces
- Backdrop dismiss still available

### Full Screen
Takes up the entire screen. Ideal for complex forms and detailed views.

```tsx
openDialog({
  variant: 'fullscreen',
  title: 'Settings',
  content: <SettingsForm />,
  backdrop: false, // No backdrop for fullscreen
});
```

**Features:**
- Full screen coverage
- No backdrop
- Safe area handling
- Perfect for complex UIs

## Advanced Usage

### Simple Dialog Hook

For common patterns, use `useSimpleDialog`:

```tsx
import { useSimpleDialog } from '@platform-blocks/react-ui-library';

function MyComponent() {
  const dialog = useSimpleDialog();

  const showConfirm = () => {
    dialog.confirm('Delete this item?', {
      onConfirm: () => console.log('Deleted'),
      onCancel: () => console.log('Cancelled'),
    });
  };

  return <Button title="Delete" onPress={showConfirm} />;
}
```

### Nested Dialogs

The system automatically handles dialog stacking:

```tsx
const openFirstDialog = () => {
  openDialog({
    variant: 'modal',
    title: 'First Dialog',
    content: (
      <Button 
        title="Open Second Dialog"
        onPress={() => openDialog({
          variant: 'modal',
          title: 'Second Dialog',
          content: <Text>Nested dialog!</Text>
        })}
      />
    ),
  });
};
```

### Custom Animations

Control animation duration:

```tsx
<Dialog
  variant="modal"
  animationDuration={300} // Custom duration in ms
  // ... other props
/>
```

## API Reference

### DialogProvider Props

| Prop | Type | Description |
|------|------|-------------|
| children | ReactNode | Your app content |

### useDialog Hook

Returns an object with:

| Method | Type | Description |
|--------|------|-------------|
| openDialog | (config: DialogConfig) => string | Opens a dialog, returns dialog ID |
| closeDialog | (id: string) => void | Closes a specific dialog |
| closeAllDialogs | () => void | Closes all open dialogs |
| dialogs | DialogConfig[] | Array of currently open dialogs |

### DialogConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'modal' \| 'bottomsheet' \| 'fullscreen' | 'modal' | Dialog variant |
| content | ReactNode | - | Dialog content |
| title | string | - | Dialog title |
| closable | boolean | true | Whether dialog can be closed |
| backdrop | boolean | true | Whether to show backdrop |
| backdropClosable | boolean | true | Whether backdrop click closes dialog |
| onClose | () => void | - | Callback when dialog closes |
| width | number | - | Custom width (modal only) |
| height | number | - | Custom height (modal only) |

### useSimpleDialog Hook

Returns an object with:

| Method | Type | Description |
|--------|------|-------------|
| modal | (content, options?) => string | Opens a modal dialog |
| bottomSheet | (content, options?) => string | Opens a bottom sheet |
| fullScreen | (content, options?) => string | Opens a full screen dialog |
| confirm | (message, options?) => string | Opens a confirmation dialog |
| close | (id: string) => void | Closes a specific dialog |
| closeAll | () => void | Closes all dialogs |

## Accessibility

The Dialog system includes:

- **Focus management**: Automatically focuses first focusable element
- **Focus trapping**: Keeps focus within the dialog
- **Screen reader support**: Proper ARIA attributes
- **Keyboard navigation**: Escape key, tab navigation
- **Reduced motion**: Respects system accessibility preferences

## Platform Considerations

### iOS/Android
- Bottom sheets use native-like slide animations
- Automatic safe area handling
- Hardware back button support (Android)
- Swipe gestures for dismissal

### Web
- Escape key support
- Focus management
- Proper semantic HTML when possible
- Backdrop click handling

## Best Practices

1. **Use appropriate variants**:
   - Modal: Confirmations, small forms
   - Bottom Sheet: Action menus, quick selections
   - Full Screen: Complex forms, settings

2. **Provide clear exit paths**:
   - Always allow backdrop/escape dismissal for non-critical dialogs
   - Include explicit close buttons for important actions

3. **Keep content focused**:
   - Use dialogs for specific tasks
   - Avoid complex navigation within dialogs

4. **Test on all platforms**:
   - Verify animations and gestures work correctly
   - Test keyboard navigation and screen readers

## Examples

See the Dialog examples in the PlatformBlocks documentation for live demonstrations of all variants and features.
