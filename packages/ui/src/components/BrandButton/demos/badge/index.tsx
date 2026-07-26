import { BrandButton, Row, useToast } from '@platform-blocks/ui';

export default function BadgeUsage() {
  const toast = useToast();

  const announce = (store: string) =>
    toast.info({
      title: `${store} pressed`,
      message: `Wire onPress up to Linking.openURL with your ${store} listing.`,
      autoHide: 3000,
    });

  return (
    <Row gap="md" wrap="wrap" justify="center" align="center">
      {/* Passing primaryText/secondaryText switches BrandButton to the badge layout. */}
      <BrandButton
        brand="app-store"
        primaryText="Download on the"
        secondaryText="App Store"
        onPress={() => announce('App Store')}
      />

      <BrandButton
        brand="google-play"
        primaryText="Get it on"
        secondaryText="Google Play"
        onPress={() => announce('Google Play')}
      />

      {/* Badges default to a black shell whatever the brand — `backgroundColor` opts one out. */}
      <BrandButton
        brand="spotify"
        primaryText="Listen on"
        secondaryText="Spotify"
        backgroundColor="#1DB954"
        onPress={() => announce('Spotify')}
      />
    </Row>
  );
}
