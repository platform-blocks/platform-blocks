import { Block, Form } from '@plocks/ui';

export function Demo() {
  return (
    <Form
      initialValues={{ name: '', email: '' }}
      onSubmit={(values) => console.log('submit', values)}
    >
      <Block style={{ width: '100%', maxWidth: 400 }}>
        <Form.Field name="name">
          <Form.Input label="Full name" placeholder="Ada Lovelace" />
        </Form.Field>
        <Form.Field name="email">
          <Form.Input label="Email" placeholder="ada@example.com" />
        </Form.Field>
        <Form.Submit>Create account</Form.Submit>
      </Block>
    </Form>
  );
}
