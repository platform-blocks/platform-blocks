import { useState } from 'react';

import { Block, CodeBlock, Text } from '@platform-blocks/ui';

const sampleCode = `const greeting = "Hello, World!";
console.log(greeting);

// A simple function
function add(a, b) {
  return a + b;
}

const result = add(5, 3);
console.log(\`5 + 3 = \${result}\`);`;

export function Demo() {
  const [copiedLength, setCopiedLength] = useState<number | null>(null);

  return (
    <Block fullWidth>
      <CodeBlock
        language="javascript"
        title="Interactive copy example"
        onCopy={(code) => setCopiedLength(code.length)}
      >
        {sampleCode}
      </CodeBlock>
      {copiedLength !== null && (
        <Text size="xs" c="success">
          Copied {copiedLength} characters to the clipboard.
        </Text>
      )}
    </Block>
  );
}
