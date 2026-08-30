import { CodeBlock, Flex } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Flex direction="column" gap={16}>
      <CodeBlock 
        title="With Title and Line Numbers"
        showLineNumbers={true}
      >
        {`function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the 10th Fibonacci number
const result = fibonacci(10);
console.log(\`Fibonacci(10) = \${result}\`);`}
      </CodeBlock>

      <CodeBlock 
        title="Full Width Example"
        fullWidth
        language="javascript"
      >
        {`// This code block spans the full width of its container
const data = [
  { id: 1, name: 'Alice', age: 30, city: 'New York' },
  { id: 2, name: 'Bob', age: 25, city: 'San Francisco' },
  { id: 3, name: 'Charlie', age: 35, city: 'Los Angeles' }
];

const processData = (data) => {
  return data
    .filter(person => person.age >= 30)
    .map(person => ({
      ...person,
      isAdult: true,
      displayName: \`\${person.name} (\${person.age})\`
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

console.log(processData(data));`}
      </CodeBlock>

      <CodeBlock 
        showCopyButton={false}
        title="No Copy Button"
      >
        {`// This example has the copy button disabled
const message = "Hello, World!";
console.log(message);`}
      </CodeBlock>
    </Flex>
  );
}
