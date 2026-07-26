import { BrandButton, Block } from '@platform-blocks/ui';

export default function BadgeColors() {
  return (
    <Block direction="row">
      <BrandButton
        brand="github"
        primaryText="View on"
        secondaryText="GitHub"
        backgroundColor="#ffffff"
        textColor="#24292e"
        borderColor="#24292e"
        onPress={() => console.log('GitHub light pressed')}
      />
      <BrandButton
        brand="spotify"
        primaryText="Listen on"
        secondaryText="Spotify"
        backgroundColor="#191414"
        textColor="#1DB954"
        borderColor="#1DB954"
        onPress={() => console.log('Spotify custom pressed')}
      />
    </Block>
  );
}
