import React, { useState } from 'react';
import { Block, Card, Divider, IconButton, Row, Switch, Text } from '@platform-blocks/ui';

export default function IconButtonDemo() {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const handlePress = (action: string) => {
    console.log(`IconButton pressed: ${action}`);
  };

  return (
    <Block p="lg">
      <Text variant="h4">IconButton Component Demo</Text>
      <Text colorVariant="muted">
        IconButton is designed specifically for displaying icons in square or circular shapes.
        Use radius="xl" for circular buttons.
      </Text>

      {/* Controls */}
      <Card p="lg" variant="outline">
        <Block>
          <Text variant="h6">Controls</Text>
          <Row gap="lg">
            <Switch
              label="Loading state"
              checked={loading}
              onChange={setLoading}
            />
            <Switch
              label="Disabled state"
              checked={disabled}
              onChange={setDisabled}
            />
          </Row>
        </Block>
      </Card>

      {/* Variants */}
      <Card p="lg" variant="outline">
        <Block>
          <Text variant="h6">Variants</Text>
          <Row gap="md" align="center" wrap="wrap">
            <IconButton
              icon="home"
              variant="default"
              onPress={() => handlePress('default')}
              loading={loading}
              disabled={disabled}
              tooltip="Home (Default)"
            />
            <IconButton
              icon="bell"
              variant="filled"
              onPress={() => handlePress('filled')}
              loading={loading}
              disabled={disabled}
              tooltip="Home (Filled)"
            />
            <IconButton
              icon="heart"
              variant="secondary"
              onPress={() => handlePress('secondary')}
              loading={loading}
              disabled={disabled}
              tooltip="Favorite (Secondary)"
            />
            <IconButton
              icon="settings"
              variant="outline"
              onPress={() => handlePress('outline')}
              loading={loading}
              disabled={disabled}
              tooltip="Settings (Outline)"
            />
            <IconButton
              icon="search"
              variant="ghost"
              onPress={() => handlePress('ghost')}
              loading={loading}
              disabled={disabled}
              tooltip="Search (Ghost)"
            />
            <IconButton
              icon="star"
              variant="gradient"
              onPress={() => handlePress('gradient')}
              loading={loading}
              disabled={disabled}
              tooltip="Star (Gradient)"
            />
          </Row>
        </Block>
      </Card>

      {/* Sizes */}
      <Card p="lg" variant="outline">
        <Block>
          <Text variant="h6">Sizes</Text>
          <Row gap="md" align="center" wrap="wrap">
            <IconButton
              icon="plus"
              size="xs"
              onPress={() => handlePress('xs')}
              tooltip="Extra Small"
            />
            <IconButton
              icon="plus"
              size="sm"
              onPress={() => handlePress('sm')}
              tooltip="Small"
            />
            <IconButton
              icon="plus"
              size="md"
              onPress={() => handlePress('md')}
              tooltip="Medium"
            />
            <IconButton
              icon="plus"
              size="lg"
              onPress={() => handlePress('lg')}
              tooltip="Large"
            />
            <IconButton
              icon="plus"
              size="xl"
              onPress={() => handlePress('xl')}
              tooltip="Extra Large"
            />
          </Row>
        </Block>
      </Card>

      {/* Shape: Square vs Circular */}
      <Card p="lg" variant="outline">
        <Block>
          <Text variant="h6">Shape: Square vs Circular</Text>
          <Row gap="md" align="center" wrap="wrap">
            <Block align="center">
              <IconButton
                icon="download"
                radius="sm"
                onPress={() => handlePress('square-sm')}
                tooltip="Small Radius (Square-ish)"
              />
              <Text size="xs" colorVariant="muted">radius="sm"</Text>
            </Block>
            <Block align="center">
              <IconButton
                icon="download"
                radius="md"
                onPress={() => handlePress('square-md')}
                tooltip="Medium Radius"
              />
              <Text size="xs" colorVariant="muted">radius="md"</Text>
            </Block>
            <Block align="center">
              <IconButton
                icon="download"
                radius="lg"
                onPress={() => handlePress('square-lg')}
                tooltip="Large Radius"
              />
              <Text size="xs" colorVariant="muted">radius="lg"</Text>
            </Block>
            <Block align="center">
              <IconButton
                icon="download"
                radius="xl"
                onPress={() => handlePress('circular')}
                tooltip="Circular (XL Radius)"
              />
              <Text size="xs" colorVariant="muted">radius="xl" (circular)</Text>
            </Block>
          </Row>
        </Block>
      </Card>

      {/* Custom Colors */}
      <Card p="lg" variant="outline">
        <Block>
          <Text variant="h6">Custom Colors</Text>
          <Row gap="md" align="center" wrap="wrap">
            <IconButton
              icon="heart"
              colorVariant="error.5"
              onPress={() => handlePress('red')}
              tooltip="Red Heart"
            />
            <IconButton
              icon="check"
              colorVariant="success.5"
              onPress={() => handlePress('green')}
              tooltip="Green Check"
            />
            <IconButton
              icon="info"
              colorVariant="info.5"
              onPress={() => handlePress('blue')}
              tooltip="Blue Info"
            />
            <IconButton
              icon="warning"
              colorVariant="warning.5"
              onPress={() => handlePress('orange')}
              tooltip="Orange Warning"
            />
            <IconButton
              icon="star"
              colorVariant="#9333ea"
              radius="xl"
              onPress={() => handlePress('purple')}
              tooltip="Purple Star (Circular)"
            />
          </Row>
        </Block>
      </Card>

      {/* Common Use Cases */}
      <Card p="lg" variant="outline">
        <Block>
          <Text variant="h6">Common Use Cases</Text>
          
          {/* Toolbar */}
          <Block>
            <Text size="sm" weight="medium">Toolbar Actions</Text>
            <Row gap="xs" align="center">
              <IconButton icon="undo" variant="ghost" size="sm" tooltip="Undo" />
              <IconButton icon="redo" variant="ghost" size="sm" tooltip="Redo" />
              <Divider orientation="vertical" style={{ height: 24 }} />
              <IconButton icon="bold" variant="ghost" size="sm" tooltip="Bold" />
              <IconButton icon="italic" variant="ghost" size="sm" tooltip="Italic" />
              <IconButton icon="underline" variant="ghost" size="sm" tooltip="Underline" />
              <Divider orientation="vertical" style={{ height: 24 }} />
              <IconButton icon="link" variant="ghost" size="sm" tooltip="Add Link" />
              <IconButton icon="image" variant="ghost" size="sm" tooltip="Add Image" />
            </Row>
          </Block>

          {/* Social Actions */}
          <Block>
            <Text size="sm" weight="medium">Social Actions (Circular)</Text>
            <Row gap="xs" align="center">
              <IconButton 
                icon="heart" 
                variant="outline" 
                radius="xl" 
                colorVariant="error.5"
                tooltip="Like" 
              />
              <IconButton 
                icon="message-circle" 
                variant="outline" 
                radius="xl" 
                colorVariant="info.5"
                tooltip="Comment" 
              />
              <IconButton 
                icon="share" 
                variant="outline" 
                radius="xl" 
                colorVariant="success.5"
                tooltip="Share" 
              />
              <IconButton 
                icon="bookmark" 
                variant="outline" 
                radius="xl" 
                tooltip="Bookmark" 
              />
            </Row>
          </Block>

          {/* Navigation */}
          <Block>
            <Text size="sm" weight="medium">Navigation</Text>
            <Row gap="xs" align="center">
              <IconButton icon="chevron-left" variant="secondary" tooltip="Previous" />
              <IconButton icon="chevron-right" variant="secondary" tooltip="Next" />
              <IconButton icon="chevron-up" variant="secondary" tooltip="Up" />
              <IconButton icon="chevron-down" variant="secondary" tooltip="Down" />
              <IconButton icon="external-link" variant="secondary" tooltip="Open External" />
            </Row>
          </Block>
        </Block>
      </Card>
    </Block>
  );
}