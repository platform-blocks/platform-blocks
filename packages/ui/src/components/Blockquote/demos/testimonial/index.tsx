import { Blockquote } from '@platform-blocks/react-ui-library';

export function Demo() {
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