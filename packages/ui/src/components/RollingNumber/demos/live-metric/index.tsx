import { useEffect, useState } from 'react';
import { Flex, RollingNumber, Text } from '@plocks/ui';

export function Demo() {
  const [requests, setRequests] = useState(84213);

  useEffect(() => {
    const timer = setInterval(() => {
      setRequests((current) => current + Math.floor(Math.random() * 40));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <Flex direction="column" gap="xs">
      <Text size="xs" c="muted" tt="uppercase">Requests today</Text>
      <RollingNumber
        value={requests}
        thousandSeparator
        size={40}
        fw="bold"
        transitionDuration={500}
        stagger={40}
      />
    </Flex>
  );
}
