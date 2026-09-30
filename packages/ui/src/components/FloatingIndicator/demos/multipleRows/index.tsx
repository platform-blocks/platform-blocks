import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Block, FloatingIndicator, Text } from '@plocks/ui';

export function Demo() {
  const [parent, setParent] = useState<View | null>(null);
  const [targets, setTargets] = useState<(View | null)[]>([]);
  const [active, setActive] = useState(4);
  const refs = useMemo(
    () =>
      Array.from(
        { length: 9 },
        (_, i) => (node: View | null) =>
          setTargets((current) =>
            current[i] === node ? current : Object.assign([...current], { [i]: node }),
          ),
      ),
    [],
  );
  return (
    <Block fullWidth>
      <View
        ref={setParent}
        style={{ position: 'relative', flexDirection: 'row', flexWrap: 'wrap', width: 180 }}
      >
        <FloatingIndicator
          parent={parent}
          target={targets[active] ?? null}
          bg="primary.2"
          style={{ borderRadius: 8 }}
        />
        {Array.from({ length: 9 }, (_, i) => (
          <Pressable
            key={i}
            ref={refs[i]}
            onPress={() => setActive(i)}
            style={{ width: 60, height: 50, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text>{i + 1}</Text>
          </Pressable>
        ))}
      </View>
    </Block>
  );
}
