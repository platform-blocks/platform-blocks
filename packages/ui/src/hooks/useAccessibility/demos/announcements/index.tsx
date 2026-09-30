import { Block, Button, Text, useAccessibility } from '@plocks/ui';

export function Demo() {
  const { announce, announcements } = useAccessibility();

  return (
    <Block align="flex-start">
      <Button onPress={() => announce(`Draft saved at ${new Date().toLocaleTimeString()}`)}>Save draft</Button>

      {announcements.map((message, index) => (
        <Text key={`${index}-${message}`} size="sm">
          {message}
        </Text>
      ))}
    </Block>
  );
}
