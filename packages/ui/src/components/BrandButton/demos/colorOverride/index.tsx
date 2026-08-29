import { BrandButton, Card, Flex, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
      <Flex direction="column" gap="lg">
        <Text variant="h6">Brand Icon Color Override</Text>
        <Text variant="p" color="secondary">
          Use the color prop to override default brand colors with a single color
        </Text>
        
        <Flex direction="column" gap="md">
          <Text variant="small" weight="600">Default Colors:</Text>
          <Flex direction="row" gap="sm" wrap="wrap">
            <BrandButton brand="google" title="Google" />
            <BrandButton brand="github" title="GitHub" />
            <BrandButton brand="spotify" title="Spotify" />
            <BrandButton brand="microsoft" title="Microsoft" />
          </Flex>
        </Flex>

        <Flex direction="column" gap="md">
          <Text variant="small" weight="600">Custom Color (#666666):</Text>
          <Flex direction="row" gap="sm" wrap="wrap">
            <BrandButton brand="google" title="Google" color="#666666" />
            <BrandButton brand="github" title="GitHub" color="#666666" />
            <BrandButton brand="spotify" title="Spotify" color="#666666" />
            <BrandButton brand="microsoft" title="Microsoft" color="#666666" />
          </Flex>
        </Flex>

        <Flex direction="column" gap="md">
          <Text variant="small" weight="600">Red Override (#E53E3E):</Text>
          <Flex direction="row" gap="sm" wrap="wrap">
            <BrandButton brand="google" title="Google" color="#E53E3E" />
            <BrandButton brand="github" title="GitHub" color="#E53E3E" />
            <BrandButton brand="spotify" title="Spotify" color="#E53E3E" />
            <BrandButton brand="microsoft" title="Microsoft" color="#E53E3E" />
          </Flex>
        </Flex>

        <Flex direction="column" gap="md">
          <Text variant="small" weight="600">Outline Variant with Color Override:</Text>
          <Flex direction="row" gap="sm" wrap="wrap">
            <BrandButton brand="google" title="Google" variant="outline" color="#8B5CF6" />
            <BrandButton brand="github" title="GitHub" variant="outline" color="#8B5CF6" />
            <BrandButton brand="spotify" title="Spotify" variant="outline" color="#8B5CF6" />
            <BrandButton brand="microsoft" title="Microsoft" variant="outline" color="#8B5CF6" />
          </Flex>
        </Flex>

      </Flex>
  );
}