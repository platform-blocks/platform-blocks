import { Block, Markdown } from '@platform-blocks/ui';

const CONTENT = `| Feature | Status | **Priority** | Notes |
|---------|--------|-------------|--------|
| Authentication | ✅ | **High** | _Complete_ |
| User Management | 🔄 | **Medium** | In progress |
| Analytics | ❌ | **Low** | \`Not started\` |
| API Integration | ✅ | **High** | [Documentation](https://example.com) |`;

export function Demo() {
  return (
    <Block fullWidth>
      <Markdown>{CONTENT}</Markdown>
    </Block>
  );
}
