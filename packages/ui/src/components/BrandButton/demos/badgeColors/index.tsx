import { BrandButton, Block } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block direction="row">
      <BrandButton
        brand="github"
        primaryText="View on"
        secondaryText="GitHub"
        bg="#ffffff"
        textColor="#24292e"
        borderColor="#24292e"
      />
      <BrandButton
        brand="spotify"
        primaryText="Listen on"
        secondaryText="Spotify"
        bg="#191414"
        textColor="#1DB954"
        borderColor="#1DB954"
      />
    </Block>
  );
}
