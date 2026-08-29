import { Block, CodeBlock, Text } from '@platform-blocks/ui';

const FILES = [
  {
    name: 'index.tsx',
    code: `import { Blockquote } from '@platform-blocks/ui';

import { AUTHOR, QUOTE } from './data';

export function Demo() {
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

export const QUOTE = 'The components feel native on every platform.';`,
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

export function Demo() {
  return (
    <Block fullWidth>
      <Text size="sm" color="secondary">
        Switch files from the tab strip in the top-left corner.
      </Text>
      <CodeBlock files={FILES} />
    </Block>
  );
}
