import { useState } from 'react';

import { Block, Button, Text, Toast, useToast } from '@platform-blocks/ui';

export default function Demo() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const showSwipeableToast = () => {
    toast.info({
      title: 'Swipe me!',
      message: 'Drag horizontally to dismiss this toast.',
      swipeConfig: {
        enabled: true,
        threshold: 150,
        direction: 'horizontal',
      },
      onSwipeDismiss: () => {
        console.log('Toast dismissed via swipe');
      },
      persistent: true,
    });
  };

  const showAnimatedToast = () => {
    toast.success({
      title: 'Spring motion',
      message: 'Bounce animation with custom spring physics.',
      animationConfig: {
        type: 'bounce',
        springConfig: {
          damping: 10,
          stiffness: 100,
        },
      },
    });
  };

  const showScaleToast = () => {
    toast.warning({
      title: 'Scale in',
      message: 'Combines scale animation with bidirectional swipe.',
      animationConfig: {
        type: 'scale',
        duration: 500,
      },
      swipeConfig: {
        enabled: true,
        direction: 'both',
      },
    });
  };

  const showToastWithActions = () => {
    toast.info({
      title: 'Actions',
      message: 'Toasts can render multiple CTA buttons.',
      actions: [
        {
          label: 'Retry',
          onPress: () => toast.success('Retrying…'),
        },
        {
          label: 'Cancel',
          onPress: () => toast.error('Cancelled'),
        },
      ],
      persistent: true,
    });
  };

  const showBatchToasts = () => {
    toast.batch([
      {
        title: 'Batch 1',
        message: 'First toast in batch',
        sev: 'info',
        groupId: 'batch-demo',
      },
      {
        title: 'Batch 2',
        message: 'Second toast in batch',
        sev: 'success',
        groupId: 'batch-demo',
      },
      {
        title: 'Batch 3',
        message: 'Third toast in batch',
        sev: 'warning',
        groupId: 'batch-demo',
      },
    ]);
  };

  const hideBatchToasts = () => {
    toast.hideGroup('batch-demo');
  };

  const showPromiseToast = async () => {
    setLoading(true);

    const mockApiCall = () =>
      new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            resolve('Success!');
          } else {
            reject('Failed!');
          }
        }, 2000);
      });

    try {
      await toast.promise(mockApiCall(), {
        pending: 'Loading data…',
        success: (data) => `Operation completed: ${data}`,
        error: (error) => `Operation failed: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Block>
      <Button onPress={showSwipeableToast}>Swipe to dismiss</Button>
      <Button variant="outline" onPress={showAnimatedToast}>
        Bounce animation
      </Button>
      <Button variant="outline" onPress={showScaleToast}>
        Scale animation + swipe
      </Button>
      <Button variant="outline" onPress={showToastWithActions}>
        Toast with actions
      </Button>
      <Button variant="outline" onPress={showBatchToasts}>
        Show batch toasts
      </Button>
      <Button variant="outline" onPress={hideBatchToasts}>
        Hide batch toasts
      </Button>
      <Button variant="outline" loading={loading} onPress={showPromiseToast}>
        Promise integration
      </Button>

      <Block>
        <Text size="xs" colorVariant="secondary">
          Tap-to-dismiss example:
        </Text>
        <Toast
          visible
          title="Tap me!"
          sev="info"
          dismissOnTap
          onClose={() => console.log('Tapped!')}
          position="bottom"
        >
          This toast can be dismissed by tapping.
        </Toast>
      </Block>
    </Block>
  );
}
