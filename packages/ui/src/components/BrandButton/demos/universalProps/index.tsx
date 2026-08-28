import { BrandButton, Card, Flex, Text } from '@platform-blocks/ui';

export default function UniversalPropsBrandButtonDemo() {
  return (
    <Card p="lg">
      <Flex direction="column" gap="lg">
        <Text variant="h6">Universal Props Demo</Text>
        <Text variant="p" colorVariant="secondary">
          These components demonstrate universal props like lightHidden and darkHidden that work across the entire library.
        </Text>
        
        <Flex direction="column" gap="md">
          <Text variant="small" weight="600">Light Mode Only (darkHidden):</Text>
          <Flex direction="row" gap="sm" wrap="wrap">
            <BrandButton brand="google" title="Google (Light Only)" darkHidden />
            <BrandButton brand="github" title="GitHub (Light Only)" darkHidden />
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

        <Text variant="em" size="xs" mt="lg" colorVariant="secondary">
          Toggle your device's dark/light mode or resize the window to see the universal props in action!
        </Text>

      </Flex>
    </Card>
  );
}