import { Button, Column } from '@plocks/ui';
import { Spotlight, useSpotlightStoreInstance } from '@plocks/spotlight';

const actions = [{ id: 'home', label: 'Go home', icon: 'home', onPress: () => {} }];
const variants = ['modal', 'bottomsheet', 'fullscreen'] as const;

function VariantPreview({ variant }: { variant: typeof variants[number] }) {
  const [store] = useSpotlightStoreInstance();
  return (
    <>
      <Button variant="light" onPress={() => store.open()}>Open {variant}</Button>
      <Spotlight variant={variant} actions={actions} store={store} />
    </>
  );
}

export function Demo() {
  return <Column gap="sm" align="flex-start">{variants.map(variant => <VariantPreview key={variant} variant={variant} />)}</Column>;
}
