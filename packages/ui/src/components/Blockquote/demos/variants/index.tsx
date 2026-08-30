import { Block, Blockquote, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
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