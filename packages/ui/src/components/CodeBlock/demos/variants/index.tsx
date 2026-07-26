import { Block, CodeBlock, Text } from '@platform-blocks/ui';

const sampleCode = `function hackTheMatrix() {
  const matrix = generateMatrix();
  console.log('Entering the matrix...');

  for (let i = 0; i < matrix.length; i += 1) {
    matrix[i].decrypt();
  }

  return 'Welcome to the real world.';
}`;

const terminalCode = `$ npm install platform-blocks
$ cd my-app
$ npm start
Server running on port 3000`;

export default function Demo() {
  return (
    <Block fullWidth>
      <Text weight="semibold">Visual variants</Text>
      <Text size="sm" colorVariant="secondary">
        Switch between default, terminal, and hacker themes using the variant prop.
      </Text>
      <Block>
        <Block>
          <Text size="sm" weight="semibold">
            Default code block
          </Text>
          <CodeBlock language="javascript" title="matrix.js">
            {sampleCode}
          </CodeBlock>
        </Block>

        <Block>
          <Text size="sm" weight="semibold">
            Terminal variant
          </Text>
          <CodeBlock variant="terminal" title="Terminal">
            {terminalCode}
          </CodeBlock>
        </Block>

        <Block>
          <Text size="sm" weight="semibold">
            Hacker variant
          </Text>
          <CodeBlock variant="hacker" language="javascript" title="hack.exe">
            {sampleCode}
          </CodeBlock>
        </Block>
      </Block>
    </Block>
  );
}