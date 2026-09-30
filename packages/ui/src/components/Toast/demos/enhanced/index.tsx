import { Block, Button, useToast } from '@plocks/ui';

export function Demo() {
  const toast = useToast();

  const showSwipeableToast = () => {
    toast.info({
      title: 'Swipe me!',
      message: 'Drag in any direction to dismiss this toast.',
      swipeConfig: { direction: 'both', threshold: 150 },
    });
  };

  const showAnimatedToast = () => {
    toast.success({
      title: 'Spring motion',
      message: 'Bounce animation with custom spring physics.',
      animationConfig: {
        type: 'bounce',
        springConfig: { damping: 10, stiffness: 100 },
      },
    });
  };

  const showBatchToasts = () => {
    toast.batch([
      { title: 'Batch 1', message: 'First toast in batch', severity: 'info' },
      { title: 'Batch 2', message: 'Second toast in batch', severity: 'success' },
      { title: 'Batch 3', message: 'Third toast in batch', severity: 'warning' },
    ]);
  };

  const showPromiseToast = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      pending: 'Loading data…',
      success: 'Data loaded',
      error: 'Could not load data',
    });
  };

  return (
    <Block>
      <Button onPress={showSwipeableToast}>Swipe to dismiss</Button>
      <Button variant="outline" onPress={showAnimatedToast}>
        Bounce animation
      </Button>
      <Button variant="outline" onPress={showBatchToasts}>
        Show batch toasts
      </Button>
      <Button variant="outline" onPress={showPromiseToast}>
        Promise integration
      </Button>
    </Block>
  );
}
