# GradientText

A text component that displays text with gradient colors. Supports customizable gradients with multiple colors, different angles, and animated transitions (web only).

## Metadata

- Canonical name: `GradientText`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { GradientText } from '@platform-blocks/react-ui-library';`
- Category: typography
- Tags: text, gradient, animation, color
- Docs: https://react-ui-library.com/components/GradientText
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/GradientText

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `colors` | string[] | Yes |  | Array of colors for the gradient (at least 2 required) |
| `locations` | number[] | No |  | Color stops (0-1) for each color. If not provided, colors are evenly distributed |
| `angle` | number | No |  | Gradient direction angle in degrees (0 = left to right, 90 = top to bottom, etc.) |
| `start` | [number, number] | No |  | Start point [x, y] (0-1). Overrides angle if provided |
| `end` | [number, number] | No |  | End point [x, y] (0-1). Overrides angle if provided |
| `position` | number | No |  | Gradient position offset (0-1). Moves the gradient along the line |
| `animation` | GradientTextAnimation | No |  | Sweep the gradient position continuously (web only). Runs as a CSS animation, so no JavaScript executes per frame. Overrides `position` while it is running; on native the gradient stays static. |
| `testID` | string | No |  | Custom testID for testing |

## Examples

### Basic
ID: `GradientText.basic` • Category: typography • Status: stable • Since: 1.0.0

Pass two or more `colors` to fill text with a gradient. All other `Text` props still apply.

```tsx
return (
    <GradientText colors={['#FF0080', '#7928CA']}>
      Hello World
    </GradientText>
  );
}
```

### Angles
ID: `GradientText.angles` • Category: typography • Status: stable • Since: 1.0.0

Different gradient directions using the `angle` prop.

```tsx
const angles = [0, 45, 90, 135];
  return (
    <Block gap="md">
      {angles.map((angle) => (
        <GradientText key={angle} colors={['#FF0080', '#7928CA']} angle={angle} size="lg">
          {angle}° gradient
        </GradientText>
      ))}
    </Block>
  );
}
```

### Controlled
ID: `GradientText.controlled` • Category: typography • Status: stable • Since: 1.0.0

Control the gradient position manually using the `position` prop (0.0 to 1.0).

```tsx
const [position, setPosition] = useState(0);
  return (
    <Block>
      <GradientText
        value="Controlled Gradient"
        position={position}
        colors={['#ff76ba', '#FF0080', '#7928CA', '#4F46E5']}
        size="3xl"
      />
      <Slider
        value={position}
        onChange={setPosition}
        min={0}
        max={1}
        step={0.01}
      />
    </Block>
  );
}
```
