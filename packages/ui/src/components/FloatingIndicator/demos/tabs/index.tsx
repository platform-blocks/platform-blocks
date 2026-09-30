import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Block, FloatingIndicator, Text } from '@plocks/ui';

export function Demo() {
  const [parent, setParent] = useState<View | null>(null);
  const [targets, setTargets] = useState<(View | null)[]>([]);
  const [active, setActive] = useState(0);
  const refs = useMemo(
    () =>
      [0, 1, 2].map(
        (i) => (node: View | null) =>
          setTargets((current) =>
            current[i] === node ? current : Object.assign([...current], { [i]: node }),
          ),
      ),
    [],
  );
  return (
    <Block fullWidth>
      <View ref={setParent} role="tablist" style={{ position: 'relative', flexDirection: 'row' }}>
        <FloatingIndicator
          parent={parent}
          target={targets[active] ?? null}
          bg="primary.2"
          style={{ borderRadius: 8 }}
        />
        {['Overview', 'Details', 'Activity'].map((label, i) => (
          <Pressable
            key={label}
            ref={refs[i]}
            role="tab"
            aria-selected={active === i}
            onPress={() => setActive(i)}
            style={{ padding: 12 }}
          >
            <Text>{label}</Text>
          </Pressable>
        ))}
      </View>
    </Block>
  );
}
