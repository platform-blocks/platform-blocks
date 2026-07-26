import { useEffect, useRef, useState } from 'react';
import { Button, Row } from '@platform-blocks/ui';

const LOADING_DURATION_MS = 2000;

export default function Demo() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const triggerLoading = (key: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setActiveKey(key);
    timeoutRef.current = setTimeout(() => {
      setActiveKey(null);
      timeoutRef.current = null;
    }, LOADING_DURATION_MS);
  };

  return (
    <Row gap="md" wrap="wrap" align="flex-start">
      <Button loading={activeKey === 'default'} onPress={() => triggerLoading('default')}>
        Submit application
      </Button>
      <Button
        loading={activeKey === 'custom'}
        loadingTitle="Submitting…"
        onPress={() => triggerLoading('custom')}
      >
        Submit application
      </Button>
      <Button
        loading={activeKey === 'disabled'}
        disabled={activeKey === 'disabled'}
        loadingTitle="Loading"
        onPress={() => triggerLoading('disabled')}
      >
        Submit application
      </Button>
    </Row>
  );
}
