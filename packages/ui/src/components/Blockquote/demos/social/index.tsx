import { Block, Blockquote } from '@platform-blocks/ui';

export default function Demo() {
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
        Just finished testing the new Platform Blocks UI library. The component quality and developer experience is outstanding!
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