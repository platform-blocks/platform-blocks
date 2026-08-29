import { Block, BrandButton, Flex, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block>
      <Flex direction="column" gap="md">
        <Text variant="small" weight="600">Light Mode Only (darkHidden):</Text>
        <Flex direction="row" gap="sm" wrap="wrap">
          <BrandButton brand="google" title="Google" darkHidden />
          <BrandButton brand="github" title="GitHub" darkHidden />
        </Flex>
      </Flex>

      <Flex direction="column" gap="md">
        <Text variant="small" weight="600">Dark Mode Only (lightHidden):</Text>
        <Flex direction="row" gap="sm" wrap="wrap">
          <BrandButton brand="spotify" title="Spotify (Dark Only)" lightHidden />
          <BrandButton brand="microsoft" title="Microsoft (Dark Only)" lightHidden />
        </Flex>
      </Flex>

      <Flex direction="column" gap="md">
        <Text variant="small" weight="600">Responsive Visibility:</Text>
        <Flex direction="row" gap="sm" wrap="wrap">
          <BrandButton brand="apple" title="Hidden on Large+" hiddenFrom={1024} />
          <BrandButton brand="amazon" title="Visible on Medium+" visibleFrom={768} />
        </Flex>
      </Flex>

      <Flex direction="column" gap="md">
        <Text variant="small" weight="600">Combined Props:</Text>
        <Flex direction="row" gap="sm" wrap="wrap">
          <BrandButton
            brand="discord"
            title="Dark + Large Screen Only"
            lightHidden
            visibleFrom={1024}
          />
        </Flex>
      </Flex>
    </Block>
  );
}