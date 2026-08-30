import { useEffect, useRef, useState } from 'react';
import { Block, Button, Row, Text } from '@platform-blocks/react-ui-library';

const LOADING_DURATION_MS = 2000;

export function Demo() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const triggerLoading = (key: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoadingKey(key);
    timeoutRef.current = setTimeout(() => {
      setLoadingKey(null);
      timeoutRef.current = null;
    }, LOADING_DURATION_MS);
  };

  return (
    <Block>
      <Block>

        <Block>
          <Button>Default width</Button>
          <Text variant="small" color="muted">
            Buttons size themselves to the label length by default.
          </Text>
        </Block>

        <Block>
          <Button w={200}>Fixed width (200)</Button>
          <Text variant="small" color="muted">
            Provide an exact `w` value for pixel-perfect toolbars.
          </Text>
        </Block>

      </Block>

      <Block>
        <Row gap="md" wrap="wrap" align="flex-start">
          <Button
            loading={loadingKey === 'long'}
            loadingTitle="Loading…"
            onPress={() => triggerLoading('long')}
          >
            Preserve width while loading
          </Button>
          <Button loading={loadingKey === 'short'} onPress={() => triggerLoading('short')}>
            Short text
          </Button>
        </Row>
        <Text variant="small" color="muted">
          When `loading` is true, the button keeps its original width so layouts stay stable.
        </Text>
      </Block>
    </Block>
  );
}
