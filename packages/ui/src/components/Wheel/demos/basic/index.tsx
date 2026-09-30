import { useState } from 'react';
import { Block, Text, Wheel } from '@plocks/ui';

const seasons = [
  { value: 'Spring', label: 'Spring' },
  { value: 'Summer', label: 'Summer' },
  { value: 'Autumn', label: 'Autumn' },
  { value: 'Winter', label: 'Winter' },
];

export function Demo() {
  const [season, setSeason] = useState('Summer');

  return (
    <Block align="center" gap="sm">
      <Wheel items={seasons} value={season} onChange={setSeason} label="Season" h={180} />
      <Text>Selected: {season}</Text>
    </Block>
  );
}
