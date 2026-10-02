# TreeSelect

Branches open within the dropdown; in single and multiple mode, leaves are selectable.

## Metadata

- Import: `import { TreeSelect } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/TreeSelect
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/TreeSelect

## Props

- `mode`: 'single' | 'multiple' | 'checkbox' = 'single'
- `value`: string | null | string[]
- `defaultValue`: string | null | string[]
- `onChange`: ((value: string | null) => void) | ((value: string[]) => void)
- `data` (required): TreeNode[]
- `placeholder`: string = 'Select…'
- `expandOnClick`: boolean = true
- `checkStrictly`: boolean = false
- `checkedStrategy`: 'child' | 'all' | 'parent' = 'child'
- `onRemove`: (value: string) => void
- `maxDisplayedValues`: number = Infinity
- `maxDisplayedValuesContent`: React.ReactNode
- `maxValues`: number
- `searchable`: boolean = false
- `searchValue`: string
- `defaultSearchValue`: string
- `onSearchChange`: (query: string) => void
- `filter`: (node: TreeNode, query: string) => boolean
- `clearSearchOnChange`: boolean = true
- `nothingFoundMessage`: React.ReactNode = 'Nothing found'
- `clearable`: boolean = false
- `allowDeselect`: boolean = true
- `withLines`: boolean = true
- `renderNode`: (node: TreeNode, state: TreeNodeState) => React.ReactNode
- `maxDropdownHeight`: number = 260
- `expandedValues`: string[]
- `defaultExpandedValues`: string[]
- `defaultExpandAll`: boolean
- `onExpandedChange`: (ids: string[]) => void
- `dropdownOpened`: boolean
- `defaultDropdownOpened`: boolean
- `onDropdownOpen`: () => void
- `onDropdownClose`: () => void
- `position`: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end' = 'bottom-start'
- `dropdownWidth`: number | 'target' = 'target'
- `offset`: number
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

## Examples

### Basics

Search and choose a leaf from a nested tree.

```tsx
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  { id: 'vegetable', label: 'Vegetable', children: [{ id: 'carrot', label: 'Carrot' }] },
];
export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} searchable />
    </Block>
  );
}
```

### Multiple Selection

Choose several leaves from the same tree.

```tsx
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  { id: 'vegetable', label: 'Vegetable', children: [{ id: 'carrot', label: 'Carrot' }] },
];
export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} mode="multiple" defaultValue={['apple']} />
    </Block>
  );
}
```

### Checkbox Selection

Checkbox mode can check several leaves.

```tsx
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  { id: 'vegetable', label: 'Vegetable', children: [{ id: 'carrot', label: 'Carrot' }] },
];
export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} mode="checkbox" />
    </Block>
  );
}
```

### Clearable

`clearable` adds a button to clear a selected value.

```tsx
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  { id: 'vegetable', label: 'Vegetable', children: [{ id: 'carrot', label: 'Carrot' }] },
];
export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} defaultValue="apple" clearable />
    </Block>
  );
}
```

### Expanded Branches

`defaultExpandAll` opens all branches initially.

```tsx
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  { id: 'vegetable', label: 'Vegetable', children: [{ id: 'carrot', label: 'Carrot' }] },
];
export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} defaultExpandAll />
    </Block>
  );
}
```

### Connecting Lines

`withLines` draws branch guides in the tree.

```tsx
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  { id: 'vegetable', label: 'Vegetable', children: [{ id: 'carrot', label: 'Carrot' }] },
];
export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} withLines />
    </Block>
  );
}
```

### Strict Checking

`checkStrictly` stops cascading checkbox changes.

```tsx
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  { id: 'vegetable', label: 'Vegetable', children: [{ id: 'carrot', label: 'Carrot' }] },
];
export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} mode="checkbox" checkStrictly />
    </Block>
  );
}
```

### Maximum Values

`maxValues` caps a multiple selection.

```tsx
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  { id: 'vegetable', label: 'Vegetable', children: [{ id: 'carrot', label: 'Carrot' }] },
];
export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} mode="multiple" maxValues={2} />
    </Block>
  );
}
```

### Custom Node

`renderNode` changes the content of each tree row.

```tsx
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  { id: 'vegetable', label: 'Vegetable', children: [{ id: 'carrot', label: 'Carrot' }] },
];
export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} renderNode={(node) => `${node.label} •`} />
    </Block>
  );
}
```

### Nothing Found

A fallback message appears when search has no matching nodes.

```tsx
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  { id: 'vegetable', label: 'Vegetable', children: [{ id: 'carrot', label: 'Carrot' }] },
];
export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} searchable nothingFoundMessage="No matching food" />
    </Block>
  );
}
```

### Dropdown Position

`position` changes where the tree opens.

```tsx
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  { id: 'vegetable', label: 'Vegetable', children: [{ id: 'carrot', label: 'Carrot' }] },
];
export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} position="top-start" dropdownWidth={320} />
    </Block>
  );
}
```

### Searchable

`searchable` filters nested nodes by their labels.

```tsx
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  {
    id: 'vegetable',
    label: 'Vegetable',
    children: [
      { id: 'carrot', label: 'Carrot' },
      { id: 'lettuce', label: 'Lettuce' },
    ],
  },
];

export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} searchable />
    </Block>
  );
}
```

### Controlled Value

`value` and `onChange` keep selection in parent state.

```tsx
import { useState } from 'react';
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
];

export function Demo() {
  const [value, setValue] = useState<string | null>('apple');
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} value={value} onChange={setValue} clearable />
    </Block>
  );
}
```

### Dropdown Offset

`offset` sets the gap between the field and its dropdown.

```tsx
import { Block, TreeSelect } from '@plocks/ui';

const data = [
  {
    id: 'fruit',
    label: 'Fruit',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
];

export function Demo() {
  return (
    <Block fullWidth>
      <TreeSelect label="Food" data={data} offset={16} />
    </Block>
  );
}
```

### Field States

`readOnly`, `disabled`, and `error` use the shared field behavior.

```tsx
import { Block, Flex, TreeSelect } from '@plocks/ui';

const data = [{ id: 'fruit', label: 'Fruit', children: [{ id: 'apple', label: 'Apple' }] }];

export function Demo() {
  return (
    <Block fullWidth>
      <Flex direction="column" gap="md">
        <TreeSelect label="Read only" data={data} defaultValue="apple" readOnly />
        <TreeSelect label="Disabled" data={data} disabled />
        <TreeSelect label="Required" data={data} required error="Choose an item" />
      </Flex>
    </Block>
  );
}
```
