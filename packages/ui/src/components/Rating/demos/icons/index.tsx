import { useState } from 'react';
import { Block, Rating, Text, useTheme } from '@platform-blocks/react-ui-library';

export function Demo() {
  const theme = useTheme();
  const [hearts, setHearts] = useState<number>(4);
  const [bolts, setBolts] = useState<number>(3);

  return (
    <Block>
      <Rating
        value={hearts}
        onChange={setHearts}
        icon="heart"
        size="lg"
        color={theme.colors.error[5]}
        emptyColor={theme.colors.error[2]}
        hoverColor={theme.colors.error[6]}
        label="Registry icon via `icon`"
      />
      <Rating
        value={bolts}
        onChange={setBolts}
        icon="bolt"
        emptyIcon="circle"
        size="lg"
        label="Different empty icon via `emptyIcon`"
      />
      <Rating
        value={3.5}
        readOnly
        allowFraction
        icon="moon"
        size="lg"
        label="Custom icons support fractions"
      />
      <Rating
        value={4}
        readOnly
        character="♥"
        emptyCharacter="♡"
        size="lg"
        label="Text glyphs via `character`"
      />
    </Block>
  );
}
