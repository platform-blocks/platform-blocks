export const SHAPES = [
  { label: 'Square modules', value: 'https://platform-blocks.com/square', moduleShape: 'square' as const, cornerRadius: undefined },
  { label: 'Rounded modules', value: 'https://platform-blocks.com/rounded', moduleShape: 'rounded' as const, cornerRadius: 0.4 },
  { label: 'Diamond modules', value: 'https://platform-blocks.com/diamond', moduleShape: 'diamond' as const, cornerRadius: undefined }
] as const;
