import { Block, CodeBlock, Text } from '@platform-blocks/ui';

const fibonacciExample = `function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the 10th Fibonacci number
const result = fibonacci(10);
console.log(\`Fibonacci(10) = \${result}\`);`;

const fullWidthExample = `// This code block spans the full width of its container
const data = [
  { id: 1, name: 'Alice', age: 30, city: 'New York' },
  { id: 2, name: 'Bob', age: 25, city: 'San Francisco' },
  { id: 3, name: 'Charlie', age: 35, city: 'Los Angeles' }
];

const processData = (rows) => {
  return rows
    .filter((person) => person.age >= 30)
    .map((person) => ({
      ...person,
      isAdult: true,
      displayName: \`\${person.name} (\${person.age})\`
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
};

console.log(processData(data));`;

const disabledCopyExample = `// This example has the copy button disabled
const message = "Hello, World!";
console.log(message);`;

export default function Demo() {
  return (
    <Block fullWidth>
      <Text weight="semibold">Feature highlights</Text>
      <Text size="sm" colorVariant="secondary">
        Combine titles, line numbers, full-width layouts, and copy controls to match different documentation needs.
      </Text>
      <Block>
        <Block>
          <Text size="sm" weight="semibold">
            Title with line numbers
          </Text>
          <CodeBlock title="With title and line numbers" showLineNumbers>
            {fibonacciExample}
          </CodeBlock>
        </Block>

        <Block>
          <Text size="sm" weight="semibold">
            Full-width layout
          </Text>
          <CodeBlock title="Full width example" fullWidth language="javascript">
            {fullWidthExample}
          </CodeBlock>
        </Block>

        <Block>
          <Text size="sm" weight="semibold">
            Copy button disabled
          </Text>
          <CodeBlock title="No copy button" showCopyButton={false}>
            {disabledCopyExample}
          </CodeBlock>
        </Block>
      </Block>
    </Block>
  );
}
