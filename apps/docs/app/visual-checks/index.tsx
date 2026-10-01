import React from 'react';
import { View } from 'react-native';
import {
  AutoComplete,
  Button,
  Card,
  ColorInput,
  FileInput,
  IconButton,
  Input,
  NumberInput,
  PasswordInput,
  PhoneInput,
  Select,
  Text,
  TextArea,
  TreeSelect,
  Title,
  useTheme,
} from '@plocks/ui';
import { Demo as DatePickerVariants } from '../../../../packages/dates/src/components/DatePickerInput/demos/variants';
import { Demo as MonthPickerVariants } from '../../../../packages/dates/src/components/MonthPickerInput/demos/variants';
import { Demo as TimePickerVariants } from '../../../../packages/dates/src/components/TimePickerInput/demos/variants';
import { Demo as YearPickerVariants } from '../../../../packages/dates/src/components/YearPickerInput/demos/variants';
import { Demo as EmojiPickerVariants } from '../../../../packages/emoji-picker/src/components/EmojiPickerInput/demos/variants';
import { Demo as CascaderVariants } from '../../../../packages/ui/src/components/Cascader/demos/variants';
import { DocsPage } from '../../components/DocsPage';
import { formatPageTitle, useBrowserTitle } from '../../hooks/useBrowserTitle';

const fieldVariants = ['default', 'filled', 'outline', 'unstyled'] as const;
const choices = [{ label: 'Apple', value: 'apple' }, { label: 'Banana', value: 'banana' }];
const fieldTypes = [
  { name: 'Input', render: (variant: typeof fieldVariants[number]) => <Input variant={variant} label="Name" placeholder="Jane Doe" /> },
  { name: 'PasswordInput', render: (variant: typeof fieldVariants[number]) => <PasswordInput variant={variant} label="Password" placeholder="Enter password" /> },
  { name: 'AutoComplete', render: (variant: typeof fieldVariants[number]) => <AutoComplete variant={variant} label="Fruit" placeholder="Search fruit" data={choices} /> },
  { name: 'Select', render: (variant: typeof fieldVariants[number]) => <Select variant={variant} label="Fruit" placeholder="Choose fruit" options={choices} /> },
  { name: 'NumberInput', render: (variant: typeof fieldVariants[number]) => <NumberInput variant={variant} label="Quantity" placeholder="Enter quantity" /> },
  { name: 'TextArea', render: (variant: typeof fieldVariants[number]) => <TextArea variant={variant} label="Notes" placeholder="Write a note" rows={2} /> },
  { name: 'ColorInput', render: (variant: typeof fieldVariants[number]) => <ColorInput variant={variant} label="Color" placeholder="Choose color" /> },
  { name: 'PhoneInput', render: (variant: typeof fieldVariants[number]) => <PhoneInput variant={variant} label="Phone" placeholder="(555) 123-4567" /> },
];

const treeOptions = [
  { id: 'fruit', label: 'Fruit', children: [{ id: 'apple', label: 'Apple' }] },
];

function FileInputVariants() {
  return (
    <View style={{ gap: 12 }}>
      {(['standard', 'compact', 'dropzone'] as const).map(variant => (
        <FileInput key={variant} variant={variant} label={variant} />
      ))}
    </View>
  );
}

function TreeSelectVariants() {
  return (
    <View style={{ gap: 12 }}>
      {fieldVariants.map(variant => (
        <TreeSelect key={variant} variant={variant} label={`${variant} variant`} data={treeOptions} placeholder="Choose a category" />
      ))}
    </View>
  );
}

const additionalFields = [
  { name: 'DatePickerInput', Component: DatePickerVariants },
  { name: 'MonthPickerInput', Component: MonthPickerVariants },
  { name: 'TimePickerInput', Component: TimePickerVariants },
  { name: 'YearPickerInput', Component: YearPickerVariants },
  { name: 'EmojiPickerInput', Component: EmojiPickerVariants },
  { name: 'FileInput', Component: FileInputVariants },
  { name: 'Cascader', Component: CascaderVariants },
  { name: 'TreeSelect', Component: TreeSelectVariants },
];

/** Stable, public-component compositions for visual regression and design review. */
export default function VisualChecksScreen() {
  useBrowserTitle(formatPageTitle('Visual checks'));
  const theme = useTheme();
  const surface = { backgroundColor: theme.backgrounds.base };

  return (
    <DocsPage>
      <View style={{ gap: 32, paddingBottom: 48 }}>
        <Title order={1}>Visual checks</Title>

        <View testID="visual-check-form-actions" style={{ ...surface, padding: 24, gap: 20 }}>
          <Title order={2}>Form actions</Title>
          {(['default', 'filled', 'light', 'outline', 'ghost'] as const).map(variant => (
            <View key={variant} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12 }}>
              <View style={{ width: 100 }}><Text>{variant}</Text></View>
              <Button title="Save changes" variant={variant} size="md" />
              <IconButton icon="heart" accessibilityLabel={`${variant} favorite`} variant={variant === 'light' ? 'secondary' : variant} size="md" />
              <View style={{ width: 260 }}>
                <AutoComplete label="Assignee" placeholder="Search people" data={choices} size="md" />
              </View>
            </View>
          ))}
        </View>

        <View testID="visual-check-field-shells" style={{ ...surface, padding: 24, gap: 20 }}>
          <Title order={2}>Field shells and variants</Title>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
            {fieldVariants.map(variant => (
              <Card key={variant} variant="outline" p="md" style={{ width: 270, gap: 16 }}>
                <Title order={3}>{variant}</Title>
                {fieldTypes.map(field => (
                  <View key={field.name} style={{ gap: 4 }}>
                    <Text variant="small" c="secondary">{field.name}</Text>
                    {field.render(variant)}
                  </View>
                ))}
              </Card>
            ))}
          </View>
        </View>

        <View testID="visual-check-additional-fields" style={{ ...surface, padding: 24, gap: 20 }}>
          <Title order={2}>Picker and specialty field variants</Title>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
            {additionalFields.map(({ name, Component }) => (
              <Card key={name} variant="outline" p="md" style={{ width: 350, gap: 12 }}>
                <Title order={3}>{name}</Title>
                <Component />
              </Card>
            ))}
          </View>
        </View>
      </View>
    </DocsPage>
  );
}
