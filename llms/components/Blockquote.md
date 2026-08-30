# Blockquote

The Blockquote component is used to highlight and stylize quotations or important text within your content. It supports various styles and can be customized to fit the design of your application.

## Metadata

- Canonical name: `Blockquote`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Blockquote } from '@platform-blocks/react-ui-library';`
- Category: typography
- Tags: blockquote, text, typography
- Docs: https://react-ui-library.com/components/Blockquote
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Blockquote

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | React.ReactNode | Yes |  | Core content |
| `variant` | 'default' \| 'testimonial' \| 'featured' \| 'minimal' | No |  | Styling |
| `size` | SizeValue | No |  |  |
| `color` | string | No |  |  |
| `quoteIcon` | string \| React.ReactNode | No |  | Quote icon |
| `quoteIconPosition` | 'top-left' \| 'top-center' \| 'bottom-right' \| 'none' | No |  |  |
| `quoteIconSize` | SizeValue | No |  |  |
| `author` | BlockquoteAuthor | No |  | Author attribution |
| `links` | BlockquoteLinks | No |  | Social/profile links |
| `date` | Date \| string | No |  | Metadata |
| `rating` | BlockquoteRating | No |  |  |
| `source` | BlockquoteSource | No |  | Brand/source |
| `verified` | boolean | No |  | Verification |
| `verifiedTooltip` | string | No |  |  |
| `alignment` | 'left' \| 'center' \| 'right' | No |  | Layout |
| `attributionAlignment` | 'left' \| 'center' \| 'right' | No |  | Which side the attribution block (avatar, name, source, meta) sits on. Defaults to `'right'`, or `'center'` when `alignment` is `'center'`. |
| `border` | boolean | No |  |  |
| `shadow` | boolean | No |  |  |
| `style` | StyleProp<ViewStyle> | No |  | Standard props |
| `onPress` | () => void | No |  |  |

## Examples

### Pull quote
ID: `Blockquote.basic` • Tags: blockquote, testimonial • Category: content • Status: stable • Since: 1.0.0

Frames a simple pull quote with author details.

```tsx
const AUTHOR = {
  name: 'Jamie Ortega',
  title: 'Principal Product Designer',
};
  return (
    <Blockquote author={AUTHOR}>
      The Blockquote component keeps editorial typography consistent so our brand voice always feels elevated.
    </Blockquote>
  );
}
```

### Testimonial card
ID: `Blockquote.testimonial` • Tags: blockquote, testimonial • Category: content • Status: stable • Since: 1.0.0

Full-fidelity testimonial with avatar, organization, rating, verified badge, and shadow.

```tsx
return (
    <Blockquote
      variant="testimonial"
      author={{
        name: 'Priya Shah',
        title: 'CTO',
        organization: 'Northwind Labs',
        avatar: require('../../../../assets/avatars/avatar-2.png'),
      }}
      rating={{ value: 5, max: 5, showValue: true }}
      source={{
        name: 'Google Business',
        brand: 'google',
      }}
      date="2024-06-12"
      verified
    >
      React UI Library helped us ship an entirely new settings experience in a single sprint. The components feel native on every platform.
    </Blockquote>
  );
}
```

### Social proof
ID: `Blockquote.social` • Tags: blockquote, social • Category: content • Status: stable • Since: 1.0.0

Maps social-style quotes into `Blockquote` with avatars, verification, and network metadata.

```tsx
return (
    <Block>
      <Blockquote
        variant="minimal"
        author={{
          name: '@futureshaper',
          avatar: require('../../../../assets/avatars/avatar-3.png'),
        }}
        source={{
          name: 'X (Twitter)',
          brand: 'x',
          url: 'https://x.com/platform-blocks',
        }}
        date="3h"
        verified
      >
        The future is going to be wild 🚀
      </Blockquote>
      <Blockquote
        variant="testimonial"
        author={{
          name: 'Jordan Reeves',
          title: 'Developer Advocate',
          avatar: require('../../../../assets/avatars/avatar-1.png'),
        }}
        source={{
          name: 'LinkedIn',
          brand: 'linkedin',
        }}
        date="1 day ago"
      >
        Just finished testing the new React UI Library UI library. The component quality and developer experience is outstanding!
      </Blockquote>
      <Blockquote
        variant="testimonial"
        author={{
          name: 'Sasha Lin',
          title: 'Staff Engineer',
        }}
        source={{
          name: 'GitHub',
          brand: 'github',
        }}
        rating={{ value: 5, max: 5, showValue: true }}
        verified
      >
        This library has saved us countless hours of development time. Clean API, great documentation, and excellent TypeScript support.
      </Blockquote>
    </Block>
  );
}
```

### Attribution side
ID: `Blockquote.attribution` • Tags: blockquote, attribution, layout • Category: content • Status: stable • Since: 1.0.0

Attribution sits on the right by default. Use `attributionAlignment` to move the avatar, name, and metadata to the left or center it under the quote.

```tsx
return (
    <Block>
      <Block>
        <Text variant="h5" weight="semibold">
          Right (default)
        </Text>
        <Blockquote
          variant="testimonial"
          shadow
          author={AUTHOR}
          source={SOURCE}
        >
          {QUOTE}
        </Blockquote>
      </Block>
      <Block>
        <Text variant="h5" weight="semibold">
          Left
        </Text>
        <Blockquote
          variant="testimonial"
          shadow
          attributionAlignment="left"
          author={AUTHOR}
          source={SOURCE}
        >
          {QUOTE}
        </Blockquote>
      </Block>
    </Block>
  );
}
```

### Variants overview
ID: `Blockquote.variants` • Tags: blockquote, variants • Category: content • Status: stable • Since: 1.0.0

Renders each preset to compare layout, alignment, and metadata options.

```tsx
return (
    <Block>
      <Block>
        <Text variant="h5" weight="semibold">
          Default
        </Text>
        <Blockquote author={{ name: 'Anonymous' }}>
          The best way to predict the future is to create it.
        </Blockquote>
      </Block>
      <Block>
        <Text variant="h5" weight="semibold">
          Testimonial
        </Text>
        <Blockquote
          variant="testimonial"
          author={{
            name: 'Sarah Johnson',
            title: 'Marketing Director',
            avatar: require('../../../../assets/avatars/avatar-4.png'),
          }}
          rating={{ value: 4, max: 5 }}
          shadow
        >
          Great experience with this service. The team was professional and delivered quality results.
        </Blockquote>
      </Block>
      <Block>
        <Text variant="h5" weight="semibold">
          Featured
        </Text>
        <Blockquote
          variant="featured"
          alignment="center"
          author={{
            name: 'Albert Einstein',
            title: 'Theoretical Physicist',
          }}
        >
          Imagination is more important than knowledge.
        </Blockquote>
      </Block>
      <Block>
        <Text variant="h5" weight="semibold">
          Minimal
        </Text>
        <Blockquote
          variant="minimal"
          quoteIconPosition="none"
          author={{ name: '@username' }}
          source={{ name: 'X (Twitter)', brand: 'x' }}
          date="2 hours ago"
        >
          Just discovered this amazing new feature! 🚀
        </Blockquote>
      </Block>
    </Block>
  );
}
```
