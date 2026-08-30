# Collapse

Displays content that can be revealed or hidden with an animation.

## Metadata

- Canonical name: `Collapse`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Collapse } from '@platform-blocks/react-ui-library';`
- Status: beta
- Category: display
- Docs: https://react-ui-library.com/components/Collapse
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Collapse

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `isCollapsed` | boolean | Yes |  | Whether the content is collapsed (hidden). `false` reveals/expands it. |
| `children` | ReactNode | Yes |  | Content to show/hide |
| `duration` | number | No | 300 | Animation duration in milliseconds |
| `transitionDuration` | number | No | 300 | Duration (ms) of the height transition. Cross-component spelling that takes precedence over `duration`; `0` snaps open/closed with no animation. |
| `timing` | 'linear' \| 'ease' \| 'ease-in' \| 'ease-out' \| 'ease-in-out' | No | 'ease-out' | Animation timing function |
| `style` | StyleProp<ViewStyle> | No |  | Style for the container |
| `contentStyle` | StyleProp<ViewStyle> | No |  | Style for the content wrapper |
| `onAnimationStart` | () => void | No |  | Callback fired when animation starts |
| `onAnimationEnd` | () => void | No |  | Callback fired when animation completes |
| `easing` | (value: number) => number | No |  | Custom easing function overriding the timing preset |
| `animateOnMount` | boolean | No | false | Whether to animate on initial mount |
| `collapsedHeight` | number | No | 0 | Custom height when collapsed (useful for partial reveals) |
| `fadeContent` | boolean | No | true | Whether to fade content in/out along with height animation |

## Examples

### Basic
ID: `Collapse.basic` • Tags: basic, collapse • Category: basics • Status: stable • Since: 1.0.0

Basic usage of the Collapse component to show and hide content with animation.

```tsx
const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <Block>
      <Button onPress={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? 'Show' : 'Hide'}
      </Button>
      <Collapse isCollapsed={isCollapsed}>
        <Text>
          This is some content inside the Collapse component. It will be shown or hidden based on the isCollapsed prop.
        </Text>
      </Collapse>
    </Block>
  );
}
```
