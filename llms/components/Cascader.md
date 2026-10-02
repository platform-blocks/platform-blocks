# Cascader

Only leaves are selected by default. Set `changeOnSelect` to allow intermediate levels.

## Metadata

- Import: `import { Cascader } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Cascader
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Cascader

## Props

- `data` (required): CascaderOption[]
- `value`: string[] | null
- `defaultValue`: string[] | null
- `onChange`: (path: string[] | null, options: CascaderOption[]) => void
- `placeholder`: string = 'Select…'
- `changeOnSelect`: boolean = false
- `allowDeselect`: boolean = true
- `closeOnSelect`: boolean = !allowDeselect
- `expandTrigger`: 'click' | 'hover' = 'click'
- `safeAreaPolygon`: boolean | { buffer?: number } = true — Protect diagonal pointer travel into the child column; buffer is in pixels. @default true
- `withColumns`: boolean = true
- `maxDisplayedLevels`: number = 3
- `previousLevelsControlLabel`: string = 'Previous levels'
- `nextLevelsControlLabel`: string = 'Next levels'
- `searchable`: boolean = false
- `filter`: (query: string, path: CascaderOption[]) => boolean
- `renderSearchOption`: (path: CascaderOption[]) => React.ReactNode
- `searchValue`: string
- `defaultSearchValue`: string
- `onSearchChange`: (query: string) => void
- `nothingFoundMessage`: React.ReactNode = 'Nothing found'
- `openOnFocus`: boolean = false
- `separator`: string = ' / '
- `formatValue`: (path: CascaderOption[]) => string
- `columnWidth`: number = 180
- `maxDropdownHeight`: number = 260
- `renderOption`: (option: CascaderOption, level: number) => React.ReactNode
- `withCheckIcon`: boolean = true
- `checkIconPosition`: 'start' | 'end' = 'end'
- `clearable`: boolean = false
- `dropdownOpened`: boolean
- `defaultDropdownOpened`: boolean
- `onDropdownOpen`: () => void
- `onDropdownClose`: () => void
- `position`: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end' = 'bottom-start'
- `offset`: number = 6
- `dropdownWidth`: number | 'target' = 'target'
- `startSection`: React.ReactNode
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface CascaderOption { value: string; label?: string; children?: CascaderOption[]; disabled?: boolean }
```

## Examples

### Basics

Drill through columns to select a city, or search the full path.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader label="Location" placeholder="Choose a city" data={data} searchable />
    </Block>
  );
}
```

### Flat Paths

`withColumns={false}` lists full paths in one column.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader label="Location" data={data} withColumns={false} />
    </Block>
  );
}
```

### Variants

Compare the default, filled, outline, and unstyled field shells on Cascader.

```tsx
import { Column, Cascader } from '@plocks/ui';

const options = [{ value: 'us', label: 'United States', children: [{ value: 'nyc', label: 'New York' }] }];

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <Cascader key={variant} variant={variant} label={`${variant} variant`} data={options} placeholder="Choose a city" />
      ))}
    </Column>
  );
}
```

### Select Intermediate Levels

`changeOnSelect` allows a parent path to be selected.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader label="Location" data={data} changeOnSelect />
    </Block>
  );
}
```

### Hover Expansion

`expandTrigger="hover"` opens the next column on hover. `safeAreaPolygon` keeps that column open during diagonal pointer travel.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader label="Location" data={data} expandTrigger="hover" />
    </Block>
  );
}
```

### Maximum Displayed Levels

`maxDisplayedLevels` limits the simultaneous columns.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader
        label="Location"
        data={data}
        maxDisplayedLevels={2}
        defaultValue={['europe', 'france', 'paris']}
      />
    </Block>
  );
}
```

### Search Paths

Search switches to a list of matching full paths.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader label="Location" data={data} searchable />
    </Block>
  );
}
```

### Nothing Found

Search displays a fallback when there are no matches.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader
        label="Location"
        data={data}
        searchable
        nothingFoundMessage="No matching locations"
      />
    </Block>
  );
}
```

### Formatted Value

`formatValue` customizes the selected path shown in the trigger.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader
        label="Location"
        data={data}
        defaultValue={['europe', 'france', 'paris']}
        formatValue={(path) => path.map((item) => item.label).join(' → ')}
      />
    </Block>
  );
}
```

### Column Width

`columnWidth` changes the width of each level.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader label="Location" data={data} columnWidth={220} />
    </Block>
  );
}
```

### Clearable

`clearable` adds a control to remove the selected path.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader
        label="Location"
        data={data}
        defaultValue={['europe', 'france', 'paris']}
        clearable
      />
    </Block>
  );
}
```

### Disabled Options

Disabled options stay visible but cannot be selected.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      { value: 'france', label: 'France', disabled: true },
      { value: 'germany', label: 'Germany' },
    ],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader label="Location" data={data} />
    </Block>
  );
}
```

### Custom Option

`renderOption` customizes each column entry.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader
        label="Location"
        data={data}
        renderOption={(option) => `${option.label ?? option.value} →`}
      />
    </Block>
  );
}
```

### Read Only

A read-only field displays its path without opening.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader
        label="Location"
        data={data}
        readOnly
        defaultValue={['europe', 'france', 'paris']}
      />
    </Block>
  );
}
```

### Error State

`error` links validation feedback to the field.

```tsx
import { Block, Cascader } from '@plocks/ui';

const data = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'france',
        label: 'France',
        children: [
          { value: 'paris', label: 'Paris' },
          { value: 'lyon', label: 'Lyon' },
        ],
      },
    ],
  },
  {
    value: 'asia',
    label: 'Asia',
    children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
  },
];
export function Demo() {
  return (
    <Block fullWidth>
      <Cascader label="Location" data={data} error="Choose a location" />
    </Block>
  );
}
```
