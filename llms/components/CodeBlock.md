# CodeBlock

The CodeBlock component renders source code with optional syntax highlighting, copy-to-clipboard, GitHub integration, line wrapping, and width controls (content-fit by default, with an opt-in full width mode). Set `wrap={false}` to disable soft wrapping and enable horizontal scrolling for long lines. `radius` and `withBorder` control the code surface itself — pair `radius="none"` with `withBorder={false}` to sit flush inside a bordered container such as `Card.Section`.

## Metadata

- Canonical name: `CodeBlock`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { CodeBlock } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: typography
- Tags: code, syntax, formatting, developer, github
- Docs: https://react-ui-library.com/components/CodeBlock
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/CodeBlock

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `language` | string | No | 'tsx' | Optional language for syntax highlighting |
| `children` | string | No |  | Source to display. Optional when `files` is provided. |
| `files` | CodeBlockFile[] | No |  | The block's source files. One entry renders its name as a header label; several render as switchable tabs. `children` is ignored while `files` is set, and a lone entry may omit `code` to keep using `children`. |
| `defaultFile` | string | No |  | File name that starts active (uncontrolled). Defaults to the first file. |
| `activeFile` | string | No |  | Active file name (controlled). Pair with `onFileChange`. |
| `onFileChange` | (fileName: string) => void | No |  | Fired when the reader switches tabs |
| `title` | string | No |  | Optional title displayed above the code block |
| `showLineNumbers` | boolean | No | false | Show line numbers in the code block |
| `highlight` | boolean | No | true | Enable syntax highlighting |
| `fullWidth` | boolean | No | true | Make the code block take the full width of its container |
| `radius` | RadiusValue | No | DEFAULT_CODE_RADIUS | Corner radius of the code surface (size token or px). Set `'none'` to sit flush inside a bordered container such as `Card.Section`. |
| `withBorder` | boolean | No | true | Draw the code surface's 1px border. Defaults to `true`. |
| `showCopyButton` | boolean | No | true | Show a copy button to copy the code to clipboard |
| `onCopy` | (code: string) => void | No |  | Callback when code is copied |
| `style` | StyleProp<ViewStyle> | No |  | Custom styles for the code block container and text |
| `textStyle` | StyleProp<TextStyle> | No |  | Custom styles for the code text |
| `titleStyle` | StyleProp<TextStyle> | No |  | Custom styles for the title text |
| `highlightLines` | Array<string \| number> | No |  | Lines to highlight, e.g. ["1", "3-5"] or [1, 3] |
| `spoiler` | boolean | No | false | Show a spoiler for the code block |
| `spoilerMaxHeight` | number | No | 160 | Maximum height for the spoiler, if exceeded a "Show More" button appears |
| `variant` | CodeBlockVariant | No | 'code' | Visual variant: default code styling, terminal emulation, or hacker theme |
| `promptSymbol` | string | No | '$' | Optional prompt prefix for terminal variant (ignored if lines already prefixed) |
| `githubUrl` | string | No |  | GitHub URL for the source shown here. Adds an edit button beside the copy button that opens it. Per-file URLs (`files[].githubUrl`) win over this one, so a multi-file block points each tab at its own source. |
| `fileHeader` | boolean | No | false | Render the file name in a detached bar above the panel instead of inline inside it. Single-file blocks only — tabs always sit inside the panel. |
| `colors` | CodeBlockColorOverrides | No |  | Override base colors (background, text, highlights) |
| `wrap` | boolean | No | true | Control whether long lines wrap (defaults to true). Set to false to enable horizontal scrolling instead. |
| `fontFamily` | string | No |  | Custom font family for the code text (overrides the default monospace stack) |
| `ff` | string | No |  | Shorthand alias for `fontFamily` |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |

## Examples

### Basic
ID: `CodeBlock.basic` • Tags: basic, code, snippet • Category: basics • Status: stable • Since: 1.0.0

Default CodeBlock showing a single snippet with automatic language detection and copy controls.

```tsx
const sample = `import { View, Text } from 'react-native';
  return (
    <View>
      <Text>Hello, World!</Text>
    </View>
  );
}`;
  return (
    <Block fullWidth>
      <Text weight="semibold">Basic code block</Text>
      <Text size="sm" color="secondary">
        The default CodeBlock renders formatted code with copy support and automatic language detection.
      </Text>
      <CodeBlock language="tsx">{sample}</CodeBlock>
    </Block>
  );
}
```

### Interactive
ID: `CodeBlock.interactive` • Tags: interactive, copy, events • Category: features • Status: stable • Since: 1.0.0

Custom onCopy handling with inline feedback and a manual trigger button.

```tsx
const sampleCode = `const greeting = "Hello, World!";
console.log(greeting);
// A simple function
function add(a, b) {
  return a + b;
}
const result = add(5, 3);
console.log(\`5 + 3 = \${result}\`);`;
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
      <Text size="sm" color="secondary">
        Attach an onCopy handler to trigger custom feedback and reuse it outside the CodeBlock controls.
      </Text>
      {copiedLength !== null && (
        <Text size="xs" color="success">
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
```

### File tabs
ID: `CodeBlock.files` • Tags: files, tabs, multi-file • Category: content • Status: stable • Since: 1.0.0

Pass `files` to show one source per tab. Each tab carries its language's logo where one exists (TypeScript, CSS) and a glyph otherwise, and highlighting follows the active file's language — `data.ts` highlights as TypeScript even though the block's `language` is `tsx`.

```tsx
const FILES = [
  {
    name: 'index.tsx',
    code: `import { Blockquote } from '@platform-blocks/react-ui-library';
  return <Blockquote author={AUTHOR}>{QUOTE}</Blockquote>;
}`,
  },
  {
    name: 'data.ts',
    code: `export const AUTHOR = {
  name: 'Priya Shah',
  title: 'CTO',
  organization: 'Northwind Labs',
};
  },
  {
    name: 'quote.css',
    code: `.quote {
  border-left: 4px solid var(--primary-5);
  padding: 16px 20px;
}`,
  },
  {
    name: 'theme.json',
    code: `{
  "primaryColor": "blue",
  "defaultRadius": "md"
}`,
  },
];
  return (
    <Block fullWidth>
      <Text size="sm" color="secondary">
        Switch files from the tab strip in the top-left corner.
      </Text>
      <CodeBlock files={FILES} />
    </Block>
  );
}
```

### GitHub
ID: `CodeBlock.github` • Tags: github, toolbar, links • Category: integrations • Status: stable • Since: 1.0.0

Surface GitHub shortcuts alongside copy controls across variants using the `githubUrl` prop.

```tsx
const componentExample = `import { View, Text } from 'react-native';
  return (
    <View>
      <Text>Hello, World!</Text>
    </View>
  );
}`;
const inlineExample = `// This code has both copy and GitHub buttons
  return <div>Hello with GitHub button!</div>;
}`;
const terminalExample = `$ npm install platform-blocks
$ npm start
Server running on http://localhost:3000`;
const floatingExample = `// Floating buttons example (no title)
  return <span>Hover to see buttons</span>;
}`;
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
```

### Languages
ID: `CodeBlock.languages` • Tags: syntax, languages, highlighting • Category: features • Status: stable • Since: 1.0.0

Examples highlighting TypeScript, JSON, and Markdown syntax rendering in CodeBlock.

```tsx
const tsxExample = `interface Props {
  title: string;
  onPress?: () => void;
}
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}`;
const jsonExample = `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.72.0"
  },
  "scripts": {
    "start": "expo start",
    "build": "expo build"
  }
}`;
const markdownExample = `# Getting Started
This is a **markdown** example with \`inline code\`.
## Features
- Syntax highlighting
- Multiple languages
- Copy functionality
> Blockquote with *emphasis* and **bold** text.`;
  return (
    <Block fullWidth>
      <Text weight="semibold">Language presets</Text>
      <Text size="sm" color="secondary">
        CodeBlock detects syntax styles across languages like TypeScript, JSON, and Markdown.
      </Text>
      <Block>
        <CodeBlock language="tsx" title="React component">
          {tsxExample}
        </CodeBlock>
        <CodeBlock language="json" title="Package configuration">
          {jsonExample}
        </CodeBlock>
        <CodeBlock language="markdown" title="Documentation">
          {markdownExample}
        </CodeBlock>
      </Block>
    </Block>
  );
}
```

### Features
ID: `CodeBlock.features` • Tags: line-numbers, full-width, copy • Category: features • Status: stable • Since: 1.0.0

Demonstrates line numbers, full-width layouts, and copy button customization in a single CodeBlock showcase.

```tsx
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
  return (
    <Block fullWidth>
      <Text weight="semibold">Feature highlights</Text>
      <Text size="sm" color="secondary">
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
```

### Variants
ID: `CodeBlock.variants` • Tags: variant, terminal, hacker • Category: styling • Status: stable • Since: 1.0.0

Compare the default, terminal, and hacker themes available through the variant prop.

```tsx
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
  return (
    <Block fullWidth>
      <Text weight="semibold">Visual variants</Text>
      <Text size="sm" color="secondary">
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
```

### Highlighting
ID: `CodeBlock.highlighting` • Tags: highlight, lines, emphasis • Category: features • Status: stable • Since: 1.0.0

Use highlightLines for single lines or ranges to draw attention to important snippets.

```tsx
const sample = `import { View, Text } from 'react-native';
interface User {
  id: number;
  name: string; // highlighted
  active: boolean;
}
  if (!user.active) {
    return null; // early return highlighted
  }
  return (
    <View style={{ padding: 8 }}>
      <Text>{user.name}</Text>
    </View>
  );
}
// Utility function (range highlighted)
  return users.filter((u) => u.active);
}`;
  return (
    <Block fullWidth>
      <Text weight="semibold">Highlighted lines</Text>
      <Text size="sm" color="secondary">
        Combine individual lines and ranges in the highlightLines prop to emphasize key logic.
      </Text>
  <CodeBlock title="Highlighted lines" showLineNumbers highlightLines={['1', '5-9', '11-14', '20-22']}>
        {sample}
      </CodeBlock>
    </Block>
  );
}
```
