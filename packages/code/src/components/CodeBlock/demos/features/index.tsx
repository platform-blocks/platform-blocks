import { Block } from '@plocks/ui';
import { CodeBlock } from '@plocks/code';

const fibonacciExample = `function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the 10th Fibonacci number
const result = fibonacci(10);
console.log(\`Fibonacci(10) = \${result}\`);`;

const disabledCopyExample = `// This example has the copy button disabled
const message = "Hello, World!";
console.log(message);`;

export function Demo() {
  return (
    <Block fullWidth>
      <CodeBlock title="With title and line numbers" showLineNumbers>
        {fibonacciExample}
      </CodeBlock>
      <CodeBlock title="No copy button" showCopyButton={false}>
        {disabledCopyExample}
      </CodeBlock>
    </Block>
  );
}
