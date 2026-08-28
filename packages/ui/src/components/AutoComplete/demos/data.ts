import type { AutoCompleteOption } from '@platform-blocks/ui';

export const sports: AutoCompleteOption[] = [
  { label: 'Football', value: 'football' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Soccer', value: 'soccer' },
  { label: 'Baseball', value: 'baseball' },
  { label: 'Tennis', value: 'tennis' },
  { label: 'Golf', value: 'golf' },
  { label: 'Swimming', value: 'swimming' },
  { label: 'Volleyball', value: 'volleyball' },
  { label: 'Cricket', value: 'cricket' },
  { label: 'Rugby', value: 'rugby' },
  { label: 'Softball', value: 'softball' },
  { label: 'Hockey', value: 'hockey' },
];

export const programmingLanguages: AutoCompleteOption[] = [
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

export const fruits: AutoCompleteOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Orange', value: 'orange' },
  { label: 'Grape', value: 'grape' },
  { label: 'Mango', value: 'mango' },
  { label: 'Pineapple', value: 'pineapple' },
];

export const musicGenres: AutoCompleteOption[] = [
  { label: 'Pop', value: 'pop' },
  { label: 'Rock', value: 'rock' },
  { label: 'Hip Hop', value: 'hiphop' },
  { label: 'Jazz', value: 'jazz' },
  { label: 'Classical', value: 'classical' },
  { label: 'Electronic', value: 'electronic' },
  { label: 'Country', value: 'country' },
  { label: 'R&B', value: 'rnb' },
];

export const countries: AutoCompleteOption[] = [
  { label: 'United States', value: 'us' },
  { label: 'Canada', value: 'ca' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Germany', value: 'de' },
  { label: 'France', value: 'fr' },
  { label: 'Italy', value: 'it' },
  { label: 'Spain', value: 'es' },
  { label: 'Netherlands', value: 'nl' },
  { label: 'Australia', value: 'au' },
  { label: 'Japan', value: 'jp' },
  { label: 'South Korea', value: 'kr' },
  { label: 'Brazil', value: 'br' },
  { label: 'Mexico', value: 'mx' },
  { label: 'India', value: 'in' },
  { label: 'China', value: 'cn' },
];

/** Same countries keyed by continent, for the grouped-suggestions demo. */
export const groupedCountries: AutoCompleteOption[] = [
  { label: 'United States', value: 'us', group: 'North America' },
  { label: 'Canada', value: 'ca', group: 'North America' },
  { label: 'Mexico', value: 'mx', group: 'North America' },
  { label: 'United Kingdom', value: 'uk', group: 'Europe' },
  { label: 'Germany', value: 'de', group: 'Europe' },
  { label: 'France', value: 'fr', group: 'Europe' },
  { label: 'Japan', value: 'jp', group: 'Asia' },
  { label: 'India', value: 'in', group: 'Asia' },
  { label: 'Australia', value: 'au', group: 'Oceania' },
  { label: 'Brazil', value: 'br', group: 'South America' },
];
