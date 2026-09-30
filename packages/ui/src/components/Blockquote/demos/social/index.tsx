import { Block, Blockquote } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';

export function Demo() {
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
          icon: <BrandIcon brand="x" size="sm" />,
          url: 'https://x.com/plocks_ui',
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
          icon: <BrandIcon brand="linkedin" size="sm" />,
        }}
        date="1 day ago"
      >
        Just finished testing the new plocks UI library. The component quality and developer experience is outstanding!
      </Blockquote>

      <Blockquote
        variant="testimonial"
        author={{
          name: 'Sasha Lin',
          title: 'Staff Engineer',
        }}
        source={{
          name: 'GitHub',
          icon: <BrandIcon brand="github" size="sm" />,
        }}
        rating={{ value: 5, max: 5, showValue: true }}
        verified
      >
        This library has saved us countless hours of development time. Clean API, great documentation, and excellent TypeScript support.
      </Blockquote>
    </Block>
  );
}