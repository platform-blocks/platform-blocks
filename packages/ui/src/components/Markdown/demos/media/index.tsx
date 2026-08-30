import { Block, Markdown, Text } from '@platform-blocks/react-ui-library';

const CONTENT = `# Media in Markdown

## Images

![PlatformBlocks Logo](https://raw.githubusercontent.com/platform-blocks/react-ui-library/main/apps/react-ui-library.com/assets/favicon.png)

## Links

Visit the [PlatformBlocks Documentation](https://react-ui-library.com) for more examples.

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| **Text Formatting** | ✅ | Bold, _italic_, \`code\` |
| Code Blocks | ✅ | Syntax highlighting |
| Tables | ✅ | Responsive layout |
| Images | ✅ | Auto-sizing |
| [Links](https://react-ui-library.com) | ✅ | External navigation |

## Horizontal Rule

Content above the line.

---

Content below the line.`;

export function Demo() {
  return (
    <Block fullWidth>
      <Markdown>{CONTENT}</Markdown>
      <Text size="sm" color="secondary">
        Images, links, tables, and horizontal rules render inline
      </Text>
    </Block>
  );
}
