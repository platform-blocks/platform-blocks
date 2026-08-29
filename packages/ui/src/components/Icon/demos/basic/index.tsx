import { ScrollView, View } from 'react-native';
import { Icon, Text, Card, Flex, Title } from '@platform-blocks/ui';

export function Demo() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 20, gap: 24 }}>
        
        {/* Header */}
        <View>
          <Text variant="h4" style={{ marginBottom: 8 }}>Icon</Text>
          <Text variant="p" color="secondary">
            Scalable vector icons with consistent sizing and theming integration.
          </Text>
        </View>

        {/* Different Sizes */}
        <Card variant="outline" style={{ padding: 20 }}>
          <Text variant="h6" style={{ marginBottom: 16 }}>Sizes</Text>
          <Text variant="p" color="secondary" style={{ marginBottom: 16 }}>
            Available in multiple sizes using the UI theme system.
          </Text>
          
          <Flex direction="row" align="center" gap="lg" wrap="wrap">
            <Flex direction="column" align="center" gap="sm">
              <Icon name="home" size="sm" />
              <Text variant="small">sm</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="home" size="md" />
              <Text variant="small">md</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="home" size="lg" />
              <Text variant="small">lg</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="home" size="xl" />
              <Text variant="small">xl</Text>
            </Flex>
          </Flex>
        </Card>

        {/* Navigation Icons */}
        <Card variant="outline" style={{ padding: 20 }}>
          <Text variant="h6" style={{ marginBottom: 16 }}>Navigation Icons</Text>
          <Text variant="p" color="secondary" style={{ marginBottom: 16 }}>
            Common navigation and directional icons.
          </Text>
          
          <Flex direction="row" align="center" gap="md" wrap="wrap">
            {['home', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down', 'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down', 'menu'].map(iconName => (
              <Flex key={iconName} direction="column" align="center" gap="xs" style={{ minWidth: 80 }}>
                <Icon name={iconName} size="xl" />
                <Text variant="small" style={{ textAlign: 'center', fontSize: 10 }}>
                  {iconName}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Card>

        {/* Action Icons */}
        <Card variant="outline" style={{ padding: 20 }}>
          <Text variant="h6" style={{ marginBottom: 16 }}>Action Icons</Text>
          <Text variant="p" color="secondary" style={{ marginBottom: 16 }}>
            Icons for common user actions and operations.
          </Text>
          
          <Flex direction="row" align="center" gap="md" wrap="wrap">
            {['plus', 'minus', 'x', 'check', 'search', 'edit', 'delete', 'save', 'copy', 'funnel', 'phone', 'toggle', 'qrcode', 'pin', 'spotlight'].map(iconName => (
              <Flex key={iconName} direction="column" align="center" gap="xs" style={{ minWidth: 80 }}>
                <Icon name={iconName} size="xl" />
                <Text variant="small" style={{ textAlign: 'center', fontSize: 10 }}>
                  {iconName}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Card>

        {/* UI Icons */}
        <Card variant="outline" style={{ padding: 20 }}>
          <Text variant="h6" style={{ marginBottom: 16 }}>UI Icons</Text>
          <Text variant="p" color="secondary" style={{ marginBottom: 16 }}>
            Interface and user experience icons.
          </Text>
          
          <Flex direction="row" align="center" gap="md" wrap="wrap">
            {['eye', 'eyeOff', 'settings', 'user', 'heart', 'star'].map(iconName => (
              <Flex key={iconName} direction="column" align="center" gap="xs" style={{ minWidth: 80 }}>
                <Icon name={iconName} size="xl" />
                <Text variant="small" style={{ textAlign: 'center', fontSize: 10 }}>
                  {iconName}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Card>

        {/* Variants */}
        <Card variant="outline" style={{ padding: 20 }}>
          <Text variant="h6" style={{ marginBottom: 16 }}>Icon Variants</Text>
          <Text variant="p" color="secondary" style={{ marginBottom: 16 }}>
            Icons can be displayed in outlined or filled variants.
          </Text>
          
          <Flex direction="column" gap="lg">
            <Flex direction="row" align="center" gap="md" wrap="wrap">
              <Title variant="small" color="secondary">Outlined (Default):</Title>
              <Icon name="star" size="xl" variant="outlined" />
              <Icon name="heart" size="xl" variant="outlined" />
              <Icon name="user" size="xl" variant="outlined" />
            </Flex>
            
            <Flex direction="row" align="center" gap="md" wrap="wrap">
              <Title variant="small" color="secondary">Filled:</Title>
              <Icon name="star" size="xl" variant="filled" />
              <Icon name="heart" size="xl" variant="filled" />
              <Icon name="user" size="xl" variant="filled" />
            </Flex>
          </Flex>
        </Card>

        {/* Custom Colors */}
        <Card variant="outline" style={{ padding: 20 }}>
          <Text variant="h6" style={{ marginBottom: 16 }}>Custom Colors</Text>
          <Text variant="p" color="secondary" style={{ marginBottom: 16 }}>
            Override icon colors to match your design.
          </Text>
          
          <Flex direction="row" align="center" gap="lg" wrap="wrap">
            <Flex direction="column" align="center" gap="sm">
              <Icon name="heart" size="xl" color="#E91E63" />
              <Text variant="small">Pink</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="star" size="xl" color="#FFC107" />
              <Text variant="small">Amber</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="check" size="xl" color="#4CAF50" />
              <Text variant="small">Green</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="settings" size="xl" color="#2196F3" />
              <Text variant="small">Blue</Text>
            </Flex>
          </Flex>
        </Card>

        {/* New Icons */}
        <Card variant="outline" style={{ padding: 20 }}>
          <Text variant="h6" style={{ marginBottom: 16 }}>New Icons</Text>
          <Text variant="p" color="secondary" style={{ marginBottom: 16 }}>
            Recently added icons for common use cases.
          </Text>
          
          <Flex direction="row" align="center" gap="lg" wrap="wrap">
            <Flex direction="column" align="center" gap="sm">
              <Icon name="link" size="lg" />
              <Text variant="small">link</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="exclamation" size="lg" />
              <Text variant="small">exclamation</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="funnel" size="lg" />
              <Text variant="small">funnel</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="camera" size="lg" />
              <Text variant="small">camera</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="mic" size="lg" />
              <Text variant="small">mic</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="bell" size="lg" />
              <Text variant="small">bell</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="calendar" size="lg" />
              <Text variant="small">calendar</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="phone" size="lg" />
              <Text variant="small">phone</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="email" size="lg" />
              <Text variant="small">email</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="folder" size="lg" />
              <Text variant="small">folder</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="file" size="lg" />
              <Text variant="small">file</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="timeline" size="lg" />
              <Text variant="small">timeline</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="loader" size="lg" />
              <Text variant="small">loader</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="switch" size="lg" />
              <Text variant="small">switch</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="carousel" size="lg" />
              <Text variant="small">carousel</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="avatar" size="lg" />
              <Text variant="small">avatar</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="toggle" size="lg" />
              <Text variant="small">toggle</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="bone" size="lg" />
              <Text variant="small">bone</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="toast" size="lg" />
              <Text variant="small">toast</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="radio" size="lg" />
              <Text variant="small">radio</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="qrcode" size="lg" />
              <Text variant="small">qrcode</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="progress" size="lg" />
              <Text variant="small">progress</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="map" size="lg" />
              <Text variant="small">map</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="list" size="lg" />
              <Text variant="small">list</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="gallery" size="lg" />
              <Text variant="small">gallery</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="pin" size="lg" />
              <Text variant="small">pin</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="tree" size="lg" />
              <Text variant="small">tree</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="keycap" size="lg" />
              <Text variant="small">keycap</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="breadcrumbs" size="lg" />
              <Text variant="small">breadcrumbs</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="pagination" size="lg" />
              <Text variant="small">pagination</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="tableofcontents" size="lg" />
              <Text variant="small">table of contents</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="stepper" size="lg" />
              <Text variant="small">stepper</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="menu" size="lg" />
              <Text variant="small">context menu</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="grid" size="lg" />
              <Text variant="small">grid</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="dialog" size="lg" />
              <Text variant="small">dialog</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="card" size="lg" />
              <Text variant="small">card</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="tooltip" size="lg" />
              <Text variant="small">tooltip</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="slider" size="lg" />
              <Text variant="small">slider</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="input" size="lg" />
              <Text variant="small">input</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="emoji" size="lg" />
              <Text variant="small">emoji</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="button" size="lg" />
              <Text variant="small">button</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="select" size="lg" />
              <Text variant="small">select</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="textarea" size="lg" />
              <Text variant="small">textarea</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="autocomplete" size="lg" />
              <Text variant="small">autocomplete</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="rating" size="lg" />
              <Text variant="small">rating</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="datatable" size="lg" />
              <Text variant="small">datatable</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="chip" size="lg" />
              <Text variant="small">chip</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="markdown" size="lg" />
              <Text variant="small">markdown</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="accordion" size="lg" />
              <Text variant="small">accordion</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="text" size="lg" />
              <Text variant="small">text</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="title" size="lg" />
              <Text variant="small">title</Text>
            </Flex>
            <Flex direction="column" align="center" gap="sm">
              <Icon name="waveform" size="lg" />
              <Text variant="small">waveform</Text>
            </Flex>
          </Flex>
        </Card>

      </View>
    </ScrollView>
  );
}