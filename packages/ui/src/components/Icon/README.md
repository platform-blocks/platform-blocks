# Icon

Themeable icon component for plocks. The default icon
set contains curated glyphs from [Tabler Icons](https://tabler.io/icons); the
component wraps them to add size tokens, filled/outlined variants, RTL mirroring,
and spacing props. Any external icon library can also be used via the `icon` prop.

> For brand/logo glyphs (Google, GitHub, …) use `BrandIcon` instead.

## Usage

```tsx
import { Icon } from '@plocks/ui';

// By registry name (Tabler-backed)
<Icon name="chevron-down" size="md" color="#666" />
<Icon name="search" size={20} />

// Filled variant (falls back to outlined when no filled glyph exists)
<Icon name="star" variant="filled" />

// Accessibility: icons are decorative (hidden from assistive technology) by
// default — inside a labelled Button/IconButton that is what you want. Give a
// standalone, meaningful icon a label and it is announced as an image.
<Icon name="user" label="User profile" />
<Icon name="star" />
```

## Using an external icon library

Pass any icon component or element directly — no registration needed:

```tsx
import { IconRocket } from '@tabler/icons-react-native';

<Icon icon={IconRocket} size="lg" color="#f00" />
<Icon icon={<IconRocket />} />
```

## Registering custom icons

Add your own icon components to the registry:

```tsx
import { registerIcon } from '@plocks/ui';
import { IconConfetti } from '@tabler/icons-react-native';

registerIcon('party', { outlined: IconConfetti });
```

## License

MIT
