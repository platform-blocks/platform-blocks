import { Block, Markdown } from '@platform-blocks/ui';

const CONTENT = `Here's some JavaScript:

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

And some TypeScript:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};
\`\`\`

Inline code: \`const result = fibonacci(10);\``;

export function Demo() {
  return (
    <Block fullWidth>
      <Markdown>{CONTENT}</Markdown>
    </Block>
  );
}
