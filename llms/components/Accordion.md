# Accordion

The Accordion component groups related content into expandable sections.

## Metadata

- Canonical name: `Accordion`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Accordion } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 0.4.0
- Category: display
- Tags: collapse, expand, panel, ui, content-grouping
- Docs: https://react-ui-library.com/components/Accordion
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Accordion

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | AccordionItem[] | Yes |  | Ordered list of items to render. The `key` for each item must be unique. |
| `type` | AccordionType | No | 'single' | Expansion behavior. 'single' ensures only one item can be expanded at a time; 'multiple' allows independent expansion. |
| `defaultExpanded` | string[] | No | [] as string[] | Initial expanded item keys (uncontrolled). Ignored when `expanded` is provided. For `type="single"` only the first key is used at initialization. |
| `expanded` | string[] | No |  | Controlled set of expanded item keys. Provide alongside `onExpandedChange`. |
| `onExpandedChange` | (expanded: string[]) => void | No |  | Called when the expanded keys change (both controlled & uncontrolled flows). |
| `onItemToggle` | OnAccordionToggle | No |  | Per-item toggle event with rich metadata. Fires after state resolution. |
| `variant` | AccordionVariant | No | 'default' | Visual variant style preset. |
| `size` | SizeValue | No | 'md' | Size scale controlling paddings, font sizes, and icon dimensions. |
| `color` | ThemeColor | No | undefined | Brand accent applied to the expanded item (title, chevron, and a subtle surface tint). Opt-in — when unset, the open state stays neutral and reads from the bolded title and rotated chevron alone. |
| `showChevron` | boolean | No | true | Whether to render the chevron affordance. |
| `chevronPosition` | 'start' \| 'end' | No | 'end' | Chevron placement relative to the header text. |
| `density` | 'comfortable' \| 'compact' \| 'spacious' | No | 'comfortable' | Space efficiency / vertical density preset. |
| `style` | StyleProp<ViewStyle> | No |  | Root container style override. |
| `headerStyle` | StyleProp<ViewStyle> | No |  | Header row style override applied to each item. |
| `contentStyle` | StyleProp<ViewStyle> | No |  | Collapsible content container style override. |
| `headerTextStyle` | StyleProp<TextStyle> | No |  | Text style applied to the header label. |
| `titleProps` | Omit<TextProps, 'children'> | No |  | Override props applied to each item's header `<Text>` (style, weight, ff, size, color). Applies to every item in the accordion. |
| `persistKey` | string | No |  | Explicit persistence key. If omitted, an automatic hash key will be generated when uncontrolled. |
| `autoPersist` | boolean | No | true | Enables persistence of expanded state (uncontrolled only) across remounts in-process. |
| `animated` | AccordionAnimationProp | No | true | Enables animation or accepts a config object for custom durations & easing. |
| `transitionDuration` | number | No | 220 | Length of the expand/collapse transition (chevron spin + panel height) in ms. Takes precedence over `animated`; `0` renders state changes instantly. Always 0 when the user prefers reduced motion. |
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
| `radius` | RadiusValue | No |  | Border radius value - supports size tokens, numbers, and special values |

## Examples

### Single Expansion
ID: `Accordion.basic` • Tags: accordion • Category: usage • Status: stable • Since: 1.0.0

Allow only one item to open at a time by setting `type="single"` and passing an items array.

```tsx
return <Accordion type="single" items={faqItems} />;
}
```

### Multiple Expansion
ID: `Accordion.multiple` • Tags: accordion, controlled • Category: behavior • Status: stable • Since: 1.0.0

Control the `expanded` keys to keep several accordion items open at the same time.

```tsx
const [expandedKeys, setExpandedKeys] = useState<string[]>(['collaboration']);
  return (
    <Accordion
      type="multiple"
      expanded={expandedKeys}
      onExpandedChange={setExpandedKeys}
      items={knowledgeBase}
    />
  );
}
```

### Visual Variants
ID: `Accordion.variants` • Tags: accordion, appearance • Category: appearance • Status: stable • Since: 1.0.0

Switch between `default`, `separated`, and `bordered` variants to adjust emphasis.

```tsx
const variants = ['default', 'separated', 'bordered'] as const;
  return (
    <Block>
      {variants.map((variant) => (
        <Block key={variant}>
          <Text size="xs" weight="600" color="muted" uppercase tracking={1}>
            {variant}
          </Text>
          <Accordion type="single" variant={variant} items={onboardingSteps} />
        </Block>
      ))}
    </Block>
  );
}
```

### Accent Colors
ID: `Accordion.colors` • Tags: accordion, appearance, color • Category: appearance • Status: stable • Since: 0.10.1

Accent each expanded panel with a theme palette — `primary`, `secondary`, `tertiary`, `success`, `warning`, `error`, or `gray`. Set `color` on the accordion for a uniform accent, or per item to mix accents in a single accordion. Collapsed items stay neutral so only the open panel is highlighted.

```tsx
return (
    <Accordion
      type="multiple"
      variant="separated"
      defaultExpanded={['healthy']}
      items={statusItems}
    />
  );
}
```

### Title customization
ID: `Accordion.title-customization` • Tags: titleProps, customization, slot-props • Category: general • Status: stable • Since: 1.0.0

`titleProps` accepts any `<Text>` props (`ff`, `weight`, `tracking`, `uppercase`, `size`, `color`, `style`) and applies them to every item header in the accordion. The existing `headerTextStyle` escape hatch still works and can be combined.

```tsx
return (
    <Accordion
      items={setupSteps}
      titleProps={{ uppercase: true, tracking: 1, weight: '700', size: 'sm' }}
    />
  );
}
```
