import { useState } from 'react';
import { Block, RadioGroup, Text } from '@platform-blocks/ui';

export default function Demo() {
  const [favoriteSport, setFavoriteSport] = useState<string>('soccer');
  const [skillLevel, setSkillLevel] = useState<string>('intermediate');

  return (
    <Block>
      <Block>
        <Text variant="small" colorVariant="muted">
          Horizontal layout
        </Text>
        <RadioGroup
          orientation="horizontal"
          value={favoriteSport}
          onChange={setFavoriteSport}
          options={[
            { label: 'Soccer', value: 'soccer' },
            { label: 'Basketball', value: 'basketball' },
            { label: 'Tennis', value: 'tennis' },
            { label: 'Volleyball', value: 'volleyball' }
          ]}
        />
      </Block>

      <Block>
        <Text variant="small" colorVariant="muted">
          Vertical layout
        </Text>
        <RadioGroup
          orientation="vertical"
          value={skillLevel}
          onChange={setSkillLevel}
          options={[
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' },
            { label: 'Expert', value: 'expert' }
          ]}
        />
      </Block>
    </Block>
  );
}


