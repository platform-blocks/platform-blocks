# Form

Form manages values, validation, and submission state for a group of inputs. Wrap each control in a `Form.Field` (which injects value and change handlers via context) and submit with `Form.Submit`.

## Metadata

- Canonical name: `Form`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Form } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: input
- Tags: form, fields, validation, submit
- Docs: https://react-ui-library.com/components/Form
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Form

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `initialValues` | Record<string, any> | No |  | Initial form values |
| `validationSchema` | ValidationSchema | No |  | Form validation schema |
| `onSubmit` | (values: Record<string, any>) => void \| Promise<void> | No |  | Submit handler |
| `validate` | (values: Record<string, any>) => Record<string, string> \| Promise<Record<string, string>> | No |  | Validation handler |
| `disabled` | boolean | No |  | Whether form is disabled |
| `validateOnChange` | boolean | No |  | Whether to validate on change |
| `validateOnBlur` | boolean | No |  | Whether to validate on blur |
| `children` | React.ReactNode | Yes |  | Children components |

## Examples

### Basic Usage
ID: `Form.basic` • Tags: form, fields, validation • Category: basics • Status: stable • Since: 1.0.0

`Form` manages values, validation, and submission state. Wrap each input in a `Form.Field` (which injects value/change handlers via context) and trigger submission with `Form.Submit`.

```tsx
return (
    <Form
      initialValues={{ name: '', email: '' }}
      onSubmit={(values) => console.log('submit', values)}
    >
      <Block style={{ width: '100%', maxWidth: 400 }}>
        <Form.Field name="name">
          <Input label="Full name" placeholder="Ada Lovelace" />
        </Form.Field>
        <Form.Field name="email">
          <Input label="Email" placeholder="ada@example.com" />
        </Form.Field>
        <Form.Submit>Create account</Form.Submit>
      </Block>
    </Form>
  );
}
```
