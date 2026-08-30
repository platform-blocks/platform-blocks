# AppShell Component

The `AppShell` component provides a complete application layout structure with integrated support for headers, drawers, footers, toast notifications, and dialog management. It's designed to be the main wrapper for your application's UI.

## Features

- **Header**: Customizable app header with navigation buttons
- **Drawer**: Collapsible side navigation drawer
- **Footer**: Optional footer content
- **Toast Management**: Built-in toast notification system
- **Dialog Integration**: Integrated dialog management
- **Safe Area Handling**: Automatic safe area support
- **Cross-platform**: Works on iOS, Android, and Web
- **Responsive**: Adapts to different screen sizes

## Components

### AppShell

The main shell component that orchestrates the layout.

```tsx
import { AppShell, AppHeader, AppFooter, AppDrawer } from '@platform-blocks/react-ui-library';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppShell
      header={<AppHeader title="My App" />}
      drawer={<AppDrawer>Navigation content</AppDrawer>}
      footer={<AppFooter>Footer content</AppFooter>}
      drawerOpen={drawerOpen}
      onDrawerStateChange={setDrawerOpen}
    >
      {/* Your main content */}
    </AppShell>
  );
}
```

### AppHeader

A customizable header component with built-in menu button support.

```tsx
<AppHeader
  title="My Application"
  withMenuButton
  onMenuPress={() => setDrawerOpen(true)}
  endSection={
    <Button>Action</Button>
  }
/>
```

### AppDrawer

A side navigation drawer with optional header and footer.

```tsx
<AppDrawer
  header={<Text size="lg">Navigation</Text>}
  footer={<Text size="sm">Version 1.0</Text>}
>
  <NavigationMenu />
</AppDrawer>
```

### AppFooter

A simple footer component for application-wide footer content.

```tsx
<AppFooter>
  <Text>© 2025 My Company</Text>
</AppFooter>
```

## Toast Management

The AppShell includes a built-in toast system accessible via the `useToast` hook:

```tsx
import { useToast } from '@platform-blocks/react-ui-library';

function MyComponent() {
  const toast = useToast();

  const showNotification = () => {
    toast.showToast({
      title: 'Success!',
      children: 'Operation completed successfully.',
      severity: 'success',
      autoHide: 3000
    });
  };

  return <Button onPress={showNotification}>Show Toast</Button>;
}
```

### Toast Methods

- `showToast(options)` - Show a toast notification
- `hideToast(id)` - Hide a specific toast
- `hideAllToasts()` - Hide all toasts

### Toast Options

- `title` - Toast title
- `children` - Toast message content
- `severity` - Severity level ('info', 'success', 'warning', 'error')
- `icon` - Custom icon component
- `autoHide` - Auto-hide duration in milliseconds (0 to disable)
- `variant` - Visual variant ('light', 'filled', 'outline')

## Props

### AppShell Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `React.ReactNode` | - | Header component |
| `footer` | `React.ReactNode` | - | Footer component |
| `drawer` | `React.ReactNode` | - | Drawer/sidebar component |
| `drawerOpen` | `boolean` | `false` | Whether drawer is open |
| `onDrawerStateChange` | `(open: boolean) => void` | - | Drawer state change callback |
| `children` | `React.ReactNode` | - | Main content |
| `backgroundColor` | `string` | - | Background color override |
| `withSafeArea` | `boolean` | `true` | Whether to include safe area handling |

### AppHeader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Header title |
| `startSection` | `React.ReactNode` | - | Left side content |
| `endSection` | `React.ReactNode` | - | Right side content |
| `withMenuButton` | `boolean` | `false` | Whether to show menu button |
| `onMenuPress` | `() => void` | - | Menu button press callback |
| `backgroundColor` | `string` | - | Background color override |
| `textColor` | `string` | - | Text color override |
| `height` | `number` | `60` | Header height |

### AppDrawer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Drawer content |
| `header` | `React.ReactNode` | - | Drawer header content |
| `footer` | `React.ReactNode` | - | Drawer footer content |
| `backgroundColor` | `string` | - | Background color override |
| `width` | `number` | `280` | Drawer width |
| `scrollable` | `boolean` | `true` | Whether content should scroll |

### AppFooter Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Footer content |
| `backgroundColor` | `string` | - | Background color override |
| `height` | `number` | - | Footer height |
| `sticky` | `boolean` | `true` | Whether footer sticks to bottom |

## Examples

### Basic Setup

```tsx
import React, { useState } from 'react';
import { 
  AppShell, 
  AppHeader, 
  AppFooter, 
  AppDrawer, 
  Text,
  Button,
  useToast 
} from '@platform-blocks/react-ui-library';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppShell
      header={
        <AppHeader
          title="My App"
          withMenuButton
          onMenuPress={() => setDrawerOpen(true)}
        />
      }
      drawer={
        <AppDrawer>
          <Text>Navigation Menu</Text>
        </AppDrawer>
      }
      footer={
        <AppFooter>
          <Text size="sm">© 2025 My App</Text>
        </AppFooter>
      }
      drawerOpen={drawerOpen}
      onDrawerStateChange={setDrawerOpen}
    >
      <MainContent />
    </AppShell>
  );
}
```

### With Toast Notifications

```tsx
function MainContent() {
  const toast = useToast();

  const handleAction = () => {
    toast.showToast({
      title: 'Action Complete',
      children: 'Your action was completed successfully!',
      severity: 'success',
      autoHide: 3000
    });
  };

  return (
    <Block p="xl">
      <Button onPress={handleAction}>
        Perform Action
      </Button>
    </Block>
  );
}
```

### Advanced Header

```tsx
<AppHeader
  title="Advanced App"
  withMenuButton
  onMenuPress={handleMenuPress}
  endSection={
    <Flex direction="row" gap="sm">
      <Button variant="ghost" size="sm">
        <Icon name="search" />
      </Button>
      <Button variant="ghost" size="sm">
        <Icon name="settings" />
      </Button>
    </Flex>
  }
/>
```

## Platform Behavior

### Web
- Drawer slides in/out with CSS transitions
- Header can be sticky on scroll
- Toast notifications appear as overlays

### Mobile (iOS/Android)
- Drawer includes overlay when open
- Safe area handling for notches and status bars
- Native-feeling animations

### Statically rendered web

A prerender runs in Node, with no viewport and no reader, so the shell cannot
know what width to draw or which color scheme to draw it in — and both wrong
guesses reach the markup, where only the cascade can still correct them.

- **Geometry** is opt-in: set `cssGeometry` and inline the stylesheet
  `createAppShellCss` builds from the same config.
- **Chrome colors** need no prop. The shell reads its header, navbar, aside,
  toc, footer, and bottom-bar fills through the variables
  `createThemeColorVariablesCss` publishes, so an app already inlining that
  stylesheet — the same one the rest of the theme's colors use — lands in the
  reader's scheme at first paint. Without it, or off the web, the shell falls
  back to literals from the resolved theme.

`shellChrome(theme)` and `shellChromeColors(theme)` return the same values, for
app chrome that has to sit flush against the shell's.

## Best Practices

1. **Keep drawer content organized** - Use clear navigation hierarchy
2. **Use toast notifications sparingly** - Only for important feedback
3. **Customize header actions** - Add relevant buttons for your app's context
4. **Handle drawer state properly** - Close drawer when navigating
5. **Test on all platforms** - Ensure consistent behavior across devices

## Accessibility

The AppShell components include built-in accessibility features:

- Screen reader support
- Keyboard navigation
- Focus management
- ARIA labels for interactive elements

## Integration with Navigation

The AppShell works seamlessly with React Navigation and other routing libraries:

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

function App() {
  return (
    <NavigationContainer>
      <AppShell /* ... props */>
        <StackNavigator />
      </AppShell>
    </NavigationContainer>
  );
}
```
