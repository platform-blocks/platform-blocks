import { Block, CodeBlock, Text } from '@platform-blocks/react-ui-library';

const componentExample = `import { View, Text } from 'react-native';

export function HelloWorld() {
  return (
    <View>
      <Text>Hello, World!</Text>
    </View>
  );
}`;

const inlineExample = `// This code has both copy and GitHub buttons
export function MyComponent() {
  return <div>Hello with GitHub button!</div>;
}`;

const terminalExample = `$ npm install platform-blocks
$ npm start
Server running on http://localhost:3000`;

const floatingExample = `// Floating buttons example (no title)
export function FloatingExample() {
  return <span>Hover to see buttons</span>;
}`;

export function Demo() {
  return (
    <Block fullWidth>
      <Text weight="semibold">GitHub actions</Text>
      <Text size="sm" color="secondary">
        Provide a GitHub URL to render quick links beside copy controls across any CodeBlock variant.
      </Text>
      <Block>
        <Block>
          <Text size="sm" weight="semibold">
            Basic component
          </Text>
          <CodeBlock
            title="Basic component"
            githubUrl="https://github.com/platform-blocks/react-ui-library/blob/main/packages/ui/src/components/Button/Button.tsx"
          >
            {componentExample}
          </CodeBlock>
        </Block>

        <Block>
          <Text size="sm" weight="semibold">
            File name and language
          </Text>
          <CodeBlock
            files={[{ name: 'example.tsx' }]}
            githubUrl="https://github.com/platform-blocks/react-ui-library/blob/main/packages/ui/src/components/Text/Text.tsx"
          >
            {inlineExample}
          </CodeBlock>
        </Block>

        <Block>
          <Text size="sm" weight="semibold">
            Terminal variant
          </Text>
          <CodeBlock
            variant="terminal"
            title="Terminal example"
            githubUrl="https://github.com/platform-blocks/react-ui-library/blob/main/apps/react-ui-library.com/eas-build-post-install.sh"
          >
            {terminalExample}
          </CodeBlock>
        </Block>

        <Block>
          <Text size="sm" weight="semibold">
            Floating controls
          </Text>
          <CodeBlock githubUrl="https://github.com/platform-blocks/react-ui-library/blob/main/packages/ui/src/components/CodeBlock/CodeBlock.tsx">
            {floatingExample}
          </CodeBlock>
        </Block>
      </Block>
    </Block>
  );
}
