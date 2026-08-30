# Icon

Themeable icon component for the PlatformBlocks UI framework. The default icon
set is backed by [`@tabler/icons-react-native`](https://tabler.io/icons); the
component wraps them to add size tokens, filled/outlined variants, RTL mirroring,
and spacing props. Any external icon library can also be used via the `icon` prop.

> Requires the `@tabler/icons-react-native` peer dependency.
> For brand/logo glyphs (Google, GitHub, …) use `BrandIcon` instead.

## Usage

```tsx
import { Icon } from '@platform-blocks/react-ui-library';

// By registry name (Tabler-backed)
<Icon name="chevron-down" size="md" color="#666" />
<Icon name="search" size={20} />

// Filled variant (falls back to outlined when no filled glyph exists)
<Icon name="star" variant="filled" />

// Accessibility / decorative
<Icon name="user" label="User profile" />
<Icon name="star" decorative />
```

## Using an external icon library

Pass any icon component or element directly — no registration needed:

```tsx
import { IconRocket } from '@tabler/icons-react-native';

<Icon icon={IconRocket} size="lg" color="#f00" />
<Icon icon={<IconRocket />} />
```

## Registering custom icons

Add your own icons to the registry (component-based or legacy SVG path):

```tsx
import { registerIcon } from '@platform-blocks/react-ui-library';
import { IconConfetti } from '@tabler/icons-react-native';

// Component-based (recommended)
registerIcon('party', { outlined: IconConfetti });

// Legacy SVG path
registerIcon('customIcon', {
  content: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z',
  viewBox: '0 0 24 24',
});
```

## License

MIT 