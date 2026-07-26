import { useEffect, useRef, useState } from 'react';

import { Block, Button, CodeBlock, Text } from '@platform-blocks/ui';

const sampleCode = `const greeting = "Hello, World!";
console.log(greeting);

// A simple function
function add(a, b) {
  return a + b;
}

const result = add(5, 3);
console.log(\`5 + 3 = \${result}\`);`;

export default function Demo() {
  const [copiedLength, setCopiedLength] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = (code: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setCopiedLength(code.length);
    timeoutRef.current = setTimeout(() => {
      setCopiedLength(null);
      timeoutRef.current = null;
    }, 2000);
  };

  return (
    <Block fullWidth>
      <Text weight="semibold">Interactive copy</Text>
      <Text size="sm" colorVariant="secondary">
        Attach an onCopy handler to trigger custom feedback and reuse it outside the CodeBlock controls.
      </Text>
      {copiedLength !== null && (
        <Text size="xs" colorVariant="success">
          Copied {copiedLength} characters to the clipboard.
        </Text>
      )}
      <CodeBlock language="javascript" title="Interactive copy example" onCopy={handleCopy}>
        {sampleCode}
      </CodeBlock>
      <Button title="Copy code manually" variant="outline" onPress={() => handleCopy(sampleCode)} />
    </Block>
  );
}
