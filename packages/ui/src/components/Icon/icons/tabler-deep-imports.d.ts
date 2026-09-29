/**
 * Types for the per-icon deep imports in ./tabler.ts
 * (`@tabler/icons-react-native/IconBell`, ...).
 *
 * @tabler/icons-react-native ships each icon's declaration at
 * `dist/icons/icons/<Name>.d.ts`, but its `./*` export points `types` at
 * `dist/icons/<Name>.d.ts`, which doesn't exist — so without this shim every
 * deep import is untyped (TS2307/TS7016). Every icon module has the same
 * shape: a default-exported `Icon` component, typed by the package root.
 *
 * Only this package's own typecheck reads this file; the emitted declarations
 * never mention the deep imports (see lib/components/Icon/icons/tabler.d.ts).
 */
declare module '@tabler/icons-react-native/*' {
  import type { Icon } from '@tabler/icons-react-native';

  const icon: Icon;
  export default icon;
}
