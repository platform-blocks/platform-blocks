# Popover

Popover sits on the same overlay primitives as Menu and Tooltip, making it suitable for interactive content like forms, lists, and quick action menus while keeping focus management predictable.

## Metadata

- Canonical name: `Popover`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Popover } from '@platform-blocks/react-ui-library';`
- Status: beta
- Category: overlay
- Docs: https://react-ui-library.com/components/Popover
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Popover

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | ReactNode | Yes |  |  |
| `opened` | boolean | No |  | Controlled open state |
| `defaultOpened` | boolean | No | false | Initial open state in uncontrolled mode |
| `onChange` | (opened: boolean) => void | No |  | Called when open state changes |
| `onOpen` | () => void | No |  | Called when popover opens |
| `onClose` | () => void | No |  | Called when popover closes |
| `onDismiss` | () => void | No |  | Called when popover is dismissed via outside click or escape |
| `trigger` | 'click' \| 'hover' | No | 'click' | How the popover is triggered: 'click' (default) or 'hover' (mostly useful for devices with a mouse) |
| `disabled` | boolean | No | false | Disable popover entirely |
| `closeOnClickOutside` | boolean | No | true | Close when clicking outside |
| `closeOnEscape` | boolean | No | true | Close when pressing Escape |
| `clickOutsideEvents` | string[] | No |  | Events considered for outside click detection (web only) |
| `trapFocus` | boolean | No |  | Trap focus within dropdown (web only) |
| `keepMounted` | boolean | No | false | Keep dropdown mounted when hidden |
| `returnFocus` | boolean | No | false | Return focus to target after close |
| `withinPortal` | boolean | No | true | Render dropdown within portal |
| `withOverlay` | boolean | No | false | Render overlay/backdrop |
| `overlayProps` | Record<string, unknown> | No |  | Overlay component props |
| `w` | number \| 'target' | No |  | Dropdown width, number or 'target' to match target width |
| `maxW` | number | No |  | Dropdown max-width |
| `maxH` | number | No |  | Dropdown max-height |
| `minW` | number | No |  | Dropdown min-width |
| `minH` | number | No |  | Dropdown min-height |
| `radius` | RadiusValue \| number | No |  | Border radius |
| `shadow` | ShadowValue | No |  | Box shadow |
| `zIndex` | number | No | 300 | Dropdown z-index |
| `position` | PlacementType | No | 'bottom' | Popover position relative to target |
| `offset` | number \| { mainAxis?: number; crossAxis?: number } | No | 8 | Offset from target |
| `floatingStrategy` | FloatingStrategy | No | 'fixed' | Floating strategy for positioning |
| `middlewares` | PopoverMiddlewares | No |  | Custom positioning options |
| `preventPositionChangeWhenVisible` | boolean | No | false | Prevent flipping/shifting when visible |
| `hideDetached` | boolean | No | true | Hide dropdown when target becomes detached |
| `viewport` | PositioningOptions['viewport'] | No |  | Override viewport padding |
| `keyboardAvoidance` | boolean | No | true | Whether positioning should avoid the on-screen keyboard |
| `fallbackPlacements` | PlacementType[] | No |  | Override fallback placements |
| `boundary` | number | No |  | Override boundary padding |
| `withRoles` | boolean | No | true | Render ARIA roles |
| `id` | string | No |  | Unique id base for accessibility |
| `withArrow` | boolean | No | false | Render arrow |
| `arrowSize` | number | No | DEFAULT_ARROW_SIZE | Arrow size |
| `arrowRadius` | number | No | 0 | Arrow border radius |
| `arrowOffset` | number | No | 5 | Arrow offset |
| `arrowPosition` | ArrowPosition | No | 'center' | Arrow position for start/end placements |
| `onPositionChange` | (placement: PlacementType) => void | No |  | Called when dropdown position changes |
| `testID` | string | No |  | Test identifier |
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

## Examples

### Basic Usage
ID: `Popover.basic` • Tags: popover • Category: usage • Status: stable • Since: 1.0.0

Popover targets wrap an interactive element and render dropdown content within `Popover.Dropdown`.

```tsx
return (
    <Popover>
      <Popover.Target>
        <Button>
          Toggle popover
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Block p="sm" style={{ maxWidth: 240 }}>
          <Text weight="semibold">Quick actions</Text>
          <Text variant="small" color="secondary">
            Popovers expose more content than tooltips without leaving the page.
          </Text>
          <Button size="xs" variant="ghost">
            Create new entry
          </Button>
          <Button size="xs" variant="ghost">
            View documentation
          </Button>
        </Block>
      </Popover.Dropdown>
    </Popover>
  );
}
```

### Hover Trigger
ID: `Popover.hover` • Tags: popover, hover, trigger • Category: usage • Status: stable • Since: 1.0.0

Set `trigger="hover"` to open the popover when the user hovers over the target element. This is useful for mouse users who want quick access to additional content without clicking.

```tsx
return (
    <Popover trigger="hover">
      <Popover.Target>
        <Button>
          Hover over me
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Block p="sm" style={{ maxWidth: 240 }}>
          <Text weight="semibold">Hover popover</Text>
          <Text variant="small" color="secondary">
            This popover opens on hover, ideal for mouse users who want quick access to additional content.
          </Text>
        </Block>
      </Popover.Dropdown>
    </Popover>
  );
}
```

### Controlled State
ID: `Popover.controlled` • Tags: popover, state • Category: behavior • Status: stable • Since: 1.0.0

Control the `opened` prop and respond to `onChange` when the popover needs to sync with surrounding form state.

```tsx
const [opened, setOpened] = useState(false);
  const [email, setEmail] = useState('team@example.com');
  return (
    <Block>
      <Checkbox
        label="Show popover"
        checked={opened}
        onChange={setOpened}
      />
      <Popover opened={opened} onChange={setOpened} trapFocus>
        <Popover.Target>
          <Button>
            Invite teammate
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Block p="sm" >
            <Text weight="semibold">Invite team member</Text>
            <Input
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              size="sm"
              fullWidth
            />
            <Button size="xs" onPress={() => setOpened(false)}>
              Send invite
            </Button>
          </Block>
        </Popover.Dropdown>
      </Popover>
    </Block>
  );
}
```

### Placement Options
ID: `Popover.placements` • Tags: popover, position • Category: layout • Status: stable • Since: 1.0.0

Set the `position` prop to control where the dropdown renders relative to its trigger.

```tsx
const OPTIONS = [
  { label: 'Top', position: 'top', description: 'Appears above the trigger.' },
  { label: 'Right', position: 'right', description: 'Anchors to the right edge.' },
  { label: 'Bottom', position: 'bottom', description: 'Drops below the trigger.' },
  { label: 'Left', position: 'left', description: 'Anchors to the left edge.' },
] as const;
  return (
    <Block direction="row">
      {OPTIONS.map(({ label, position, description }) => (
        <Popover key={position} position={position} withArrow>
          <Popover.Target>
            <Button>
              {label}
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Block p="sm" style={{ maxWidth: 220 }}>
              <Text weight="semibold">{label} placement</Text>
              <Text variant="small" color="secondary">
                {description}
              </Text>
            </Block>
          </Popover.Dropdown>
        </Popover>
      ))}
    </Block>
  );
}
```
