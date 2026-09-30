import { forwardRef, useRef } from 'react';
import type { TextInput } from 'react-native';
import { Block, Button, Input, useMergedRef } from '@plocks/ui';

const SearchField = forwardRef<TextInput, { placeholder?: string }>(function SearchField({ placeholder }, ref) {
  const ownRef = useRef<TextInput>(null);
  const mergedRef = useMergedRef(ownRef, ref);

  return <Input ref={mergedRef} placeholder={placeholder} onEnter={() => ownRef.current?.blur()} />;
});

export function Demo() {
  const searchRef = useRef<TextInput>(null);

  return (
    <Block align="flex-start" maw={360} fullWidth>
      <SearchField ref={searchRef} placeholder="Search" />
      <Button onPress={() => searchRef.current?.focus()}>Focus search</Button>
    </Block>
  );
}
