import { useEffect, useState } from 'react';
import { Card, Flex, RollingNumber, Text } from '@platform-blocks/ui';

export function Demo() {
  const [requests, setRequests] = useState(84213);

  useEffect(() => {
    const timer = setInterval(() => {
      setRequests((current) => current + Math.floor(Math.random() * 40));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card p="lg" style={{ minWidth: 220 }}>
      <Flex direction="column" gap="xs">
        <Text size="xs" c="dimmed" uppercase>Requests today</Text>
        <RollingNumber
          value={requests}
          thousandSeparator
          size={40}
          weight="bold"
          transitionDuration={500}
          stagger={40}
        />
      </Flex>
    </Card>
  );
}
