# Image

The `Image` component displays images with optional captions and overlays, providing a flexible way to present visual content in your application.

## Metadata

- Canonical name: `Image`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Image } from '@platform-blocks/react-ui-library';`
- Status: beta
- Category: media
- Docs: https://react-ui-library.com/components/Image
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Image

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `src` | string \| ImageSourcePropType | No |  | Remote image URI, or a bundled asset from `require('./photo.png')` |
| `source` | ImageSourcePropType | No |  | Image source object (alternative to src) |
| `alt` | string | No |  | Alternative text for accessibility |
| `accessibilityLabel` | string | No |  | Accessibility label |
| `resizeMode` | 'cover' \| 'contain' \| 'stretch' \| 'repeat' \| 'center' | No |  | Image resize mode |
| `size` | SizeValue \| number | No |  | Image size preset |
| `w` | number \| string | No |  | Custom width |
| `h` | number \| string | No |  | Custom height |
| `aspectRatio` | number | No |  | Aspect ratio |
| `borderWidth` | number | No |  | Border width |
| `borderColor` | ColorValue | No |  | Border color |
| `rounded` | boolean | No |  | Whether image should be rounded |
| `circle` | boolean | No |  | Whether image should be circular |
| `fallback` | React.ReactNode | No |  | Fallback element to show on error |
| `loading` | React.ReactNode | No |  | Loading state element |
| `onLoad` | () => void | No |  | Called when image loads successfully |
| `onError` | (error: any) => void | No |  | Called when image fails to load |
| `onLoadStart` | () => void | No |  | Called when image starts loading |
| `onLoadEnd` | () => void | No |  | Called when image finishes loading (success or error) |
| `containerStyle` | StyleProp<ViewStyle> | No |  | Container style |
| `imageStyle` | StyleProp<ImageStyle> | No |  | Image style overrides |
| `testID` | string | No |  | Component test ID for testing |
| `style` | any | No |  | Additional CSS styles |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |
| `fullWidth` | boolean | No |  | Makes the component fill the full width of its parent |
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `maxH` | DimensionValue | No |  | Sets the maximum height |
| `minH` | DimensionValue | No |  | Sets the minimum height |
| `radius` | RadiusValue | No |  | Border radius value - supports size tokens, numbers, and special values |

## Examples

### Sizes
ID: `Image.sizes` • Tags: size, layout • Category: layout • Status: stable • Since: 0.3.0

Set the `size` prop to any token (`xs`–`3xl`) to scale the image box, or pass `w`/`h` when you need exact dimensions.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
/** Inline 8x8 PNG — keeps the demo offline and identical on web and native. */
const SAMPLE_SRC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAALklEQVR42mNITvsIR409P+CIAasokMuAVRQqgSkKksAqiiKB5goGrKJQCawuBgC2Wnfh+zNA9wAAAABJRU5ErkJggg==';
  return (
    <Row align="flex-end" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Image src={SAMPLE_SRC} size={size} radius="md" alt={`Sample image at ${size}`} />
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Basic
ID: `Image.basic` • Category: general

```tsx
return (
    <Card>
      <Text size="lg" weight="semibold" mb={16}>Basic Image Usage</Text>
      <Block>
        <Image 
          src={require('../../../../assets/images/scene-mountains.png')}
          alt="Mountain landscape"
          w={300}
          h={200}
        />
        <Text size="sm" color="gray.6">
          A simple image with specified dimensions
        </Text>
      </Block>
    </Card>
  );
}
```

### Fallback
ID: `Image.fallback` • Category: general

```tsx
return (
    <Card>
      <Text size="lg" weight="semibold" mb={16}>Image Fallback & Error Handling</Text>
      <Row gap={24} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Block>
          <Image 
            src="https://invalid-url-that-will-fail.com/image.jpg"
            w={120}
            h={80}
            fallback={
              <Icon name="image-off" size={24} color="gray.5" />
            }
            alt="Failed to load"
          />
          <Text size="sm" mt={8}>With Icon Fallback</Text>
        </Block>
        <Block>
          <Image 
            src="https://another-invalid-url.com/image.jpg"
            w={120}
            h={80}
            fallback={
              <Text size="sm" color="gray.6" style={{ textAlign: 'center' }}>
                Image not found
              </Text>
            }
            alt="Failed to load"
          />
          <Text size="sm" mt={8}>With Text Fallback</Text>
        </Block>
      </Row>
      <Text size="sm" color="gray.6" mt={16}>
        When images fail to load, fallback content is displayed
      </Text>
    </Card>
  );
}
```

### Shapes
ID: `Image.shapes` • Category: general

```tsx
return (
    <Card>
      <Text size="lg" weight="semibold" mb={16}>Image Shapes</Text>
      <Row gap={24} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Block style={{ alignItems: 'center' }}>
          <Image 
            src={require('../../../../assets/images/scene-lake.png')}
            size={80}
            alt="Default"
          />
          <Text size="sm" mt={8}>Default</Text>
        </Block>
        <Block style={{ alignItems: 'center' }}>
          <Image 
            src={require('../../../../assets/images/scene-lake.png')}
            size={80}
            rounded
            alt="Rounded"
          />
          <Text size="sm" mt={8}>Rounded</Text>
        </Block>
        <Block style={{ alignItems: 'center' }}>
          <Image 
            src={require('../../../../assets/images/scene-lake.png')}
            size={80}
            circle
            alt="Circle"
          />
          <Text size="sm" mt={8}>Circle</Text>
        </Block>
      </Row>
      <Text size="sm" color="gray.6" mt={16}>
        Shape variations: default, rounded corners, and circular
      </Text>
    </Card>
  );
}
```

### Spacing
ID: `Image.spacing` • Category: general

```tsx
return (
    <Card>
      <Text size="lg" weight="semibold" mb={16}>Universal Spacing Props</Text>
      <Block>
        {/* Auto margin example */}
        <View>
          <Text size="md" weight="medium" mb={8}>Auto Margin Example</Text>
          <View style={{ backgroundColor: '#f0f0f0', padding: 16 }}>
            <Image 
              src={require('../../../../assets/images/scene-meadow.png')}
              alt="Centered image"
              w={100}
              h={100}
              m="auto"
            />
          </View>
          <Text size="sm" color="gray.6" mt={4}>
            Image with m="auto" should be centered
          </Text>
        </View>
        {/* Theme spacing example */}
        <View>
          <Text size="md" weight="medium" mb={8}>Theme Spacing Values</Text>
          <View style={{ backgroundColor: '#f0f0f0', padding: 16 }}>
            <Image 
              src={require('../../../../assets/images/scene-meadow.png')}
              alt="Image with theme spacing"
              w={80}
              h={80}
              m="lg"
            />
          </View>
          <Text size="sm" color="gray.6" mt={4}>
            Image with m="lg" using theme spacing
          </Text>
        </View>
        {/* Numeric spacing example */}
        <View>
          <Text size="md" weight="medium" mb={8}>Numeric Spacing Values</Text>
          <View style={{ backgroundColor: '#f0f0f0', padding: 16 }}>
            <Image 
              src={require('../../../../assets/images/scene-meadow.png')}
              alt="Image with numeric spacing"
              w={60}
              h={60}
              m={20}
            />
          </View>
          <Text size="sm" color="gray.6" mt={4}>
            Image with m={`{20}`} using numeric spacing
          </Text>
        </View>
        {/* Zero margin example */}
        <View>
          <Text size="md" weight="medium" mb={8}>Zero Margin Example</Text>
          <View style={{ backgroundColor: '#f0f0f0', padding: 16 }}>
            <Image 
              src={require('../../../../assets/images/scene-meadow.png')}
              alt="Image with zero margin"
              w={60}
              h={60}
              m="0"
            />
          </View>
          <Text size="sm" color="gray.6" mt={4}>
            Image with m="0" should have no margin
          </Text>
        </View>
        {/* Mixed spacing props example */}
        <View>
          <Text size="md" weight="medium" mb={8}>Mixed Spacing Props</Text>
          <View style={{ backgroundColor: '#f0f0f0', padding: 16 }}>
            <Image 
              src={require('../../../../assets/images/scene-meadow.png')}
              alt="Image with mixed spacing"
              w={80}
              h={80}
              mx="auto"
              my="md"
              p="sm"
            />
          </View>
          <Text size="sm" color="gray.6" mt={4}>
            Image with mx="auto", my="md", p="sm"
          </Text>
        </View>
      </Block>
    </Card>
  );
}
```
