import { Block, Splitter, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Splitter h={160} redistribute="nearest">
        {['A', 'B', 'C', 'D'].map((item) => (
          <Splitter.Pane
            key={item}
            defaultSize={25}
            min={item === 'B' ? 20 : 10}
            bg="subtle"
            p="sm"
          >
            <Text>{item}</Text>
          </Splitter.Pane>
        ))}
      </Splitter>
    </Block>
  );
}
