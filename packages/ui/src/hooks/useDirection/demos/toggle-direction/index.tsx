import { Block, Button, DataList, useDirection } from '@plocks/ui';

export function Demo() {
  const { dir, isRTL, toggleDirection } = useDirection();

  return (
    <Block align="flex-start" maw={320}>
      <DataList
        labelWidth={80}
        data={[
          { label: 'dir', value: dir },
          { label: 'isRTL', value: String(isRTL) },
        ]}
      />
      <Button onPress={toggleDirection}>Switch to {isRTL ? 'LTR' : 'RTL'}</Button>
    </Block>
  );
}
