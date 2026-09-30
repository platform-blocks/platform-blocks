import { AutoComplete, Block } from '@plocks/ui';

const languages = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'C#', value: 'csharp' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'Swift', value: 'swift' },
  { label: 'Kotlin', value: 'kotlin' },
];

const searchLanguages = async (query: string) => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const normalized = query.toLowerCase();
  return languages.filter((language) => language.label.toLowerCase().includes(normalized));
};

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Search programming languages"
        placeholder="Start typing..."
        onSearch={searchLanguages}
        fullWidth
      />
    </Block>
  );
}
