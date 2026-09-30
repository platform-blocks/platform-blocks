import { Block, Spoiler, Text } from '@plocks/ui';

const paragraphs = [
  'Spoilers collapse long sections of copy while keeping the content accessible to screen readers and keyboard users.',
  'Use them for optional detail or secondary information that might distract from a primary task. They expand inline, so the surrounding layout stays stable.',
  'They suit release notes, FAQ answers, long product descriptions, and legal terms: copy that most readers skim past but that some readers need to see in full before they make a decision.',
];

export function Demo() {
  return (
    <Block fullWidth>
      <Spoiler mah={96}>
        <Block>
          {paragraphs.map((paragraph) => (
            <Text key={paragraph}>{paragraph}</Text>
          ))}
        </Block>
      </Spoiler>
    </Block>
  );
}
