import React, { useState } from 'react';
import { CodeBlock, Button, Text, Flex } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [copiedCode, setCopiedCode] = useState('');

  const handleCopy = (code: string) => {
    setCopiedCode(code);
    // In a real app, you might use Clipboard API or show a toast
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const sampleCode = `const greeting = "Hello, World!";
console.log(greeting);

// A simple function
function add(a, b) {
  return a + b;
}

const result = add(5, 3);
console.log(\`5 + 3 = \${result}\`);`;

  return (
    <Flex direction="column" gap={16}>
      {copiedCode ? (
        <Text color="success">
          Copied code to clipboard! (Length: {copiedCode.length} characters)
        </Text>
      ) : null}
      
      <CodeBlock 
        language="javascript"
        title="Interactive Copy Example"
        onCopy={handleCopy}
      >
        {sampleCode}
      </CodeBlock>

      <Button 
        title="Copy Code Manually" 
        variant="outline" 
        onPress={() => handleCopy(sampleCode)} 
      />
    </Flex>
  );
}
