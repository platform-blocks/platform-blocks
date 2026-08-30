import { Block, Markdown, Text } from '@platform-blocks/react-ui-library';

const CONTENT = `# Table examples

## Basic table

| Name | Age | City |
|------|-----|------|
| John Doe | 30 | New York |
| Jane Smith | 25 | Los Angeles |
| Bob Johnson | 35 | Chicago |

## Table with formatting

| Feature | Status | **Priority** | Notes |
|---------|--------|-------------|--------|
| Authentication | ✅ | **High** | _Complete_ |
| User Management | 🔄 | **Medium** | In progress |
| Analytics | ❌ | **Low** | \`Not started\` |
| API Integration | ✅ | **High** | [Documentation](https://example.com) |

## Table with code

| Language | Extension | Sample code |
|----------|-----------|-------------|
| TypeScript | \`.tsx\` | \`const x: string = "hello";\` |
| JavaScript | \`.js\` | \`function hello() { return "world"; }\` |
| Python | \`.py\` | \`def hello(): return "world"\` |

## Complex table

| Component | **Props** | _Description_ | Example |
|-----------|----------|-------------|---------|
| Button | \`variant\`, \`size\`, \`disabled\` | Interactive button element | \`<Button variant="filled">Click me</Button>\` |
| Input | \`placeholder\`, \`value\`, \`onChange\` | Text input field | \`<Input placeholder="Enter text" />\` |
| Card | \`variant\`, \`padding\` | Container component | \`<Card variant="outline">Content</Card>\` |`;

export function Demo() {
  return (
    <Block fullWidth>
      <Markdown>{CONTENT}</Markdown>
      <Text size="sm" color="secondary">
        Multiple table layouts rendered with Markdown
      </Text>
    </Block>
  );
}
