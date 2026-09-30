import { Block, Text } from '@plocks/ui';
import { CodeBlock } from '@plocks/code';

const sampleCode = `function hackTheMatrix() {
  const matrix = generateMatrix();
  console.log('Entering the matrix...');

  for (let i = 0; i < matrix.length; i += 1) {
    matrix[i].decrypt();
  }

  return 'Welcome to the real world.';
}`;

const terminalCode = `$ npm install @plocks/ui
$ cd my-app
$ npm start
Server running on port 3000`;

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text size="sm" fw="semibold">
          Default code block
        </Text>
        <CodeBlock language="javascript" title="matrix.js">
          {sampleCode}
        </CodeBlock>
      </Block>

      <Block>
        <Text size="sm" fw="semibold">
          Terminal variant
        </Text>
        <CodeBlock variant="terminal" title="Terminal">
          {terminalCode}
        </CodeBlock>
      </Block>

      <Block>
        <Text size="sm" fw="semibold">
          Hacker variant
        </Text>
        <CodeBlock variant="hacker" language="javascript" title="hack.exe">
          {sampleCode}
        </CodeBlock>
      </Block>
    </Block>
  );
}