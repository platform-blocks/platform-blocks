import { Block, Form, Input } from '@platform-blocks/ui';

export function Demo() {
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
