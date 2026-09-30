import { StyleSheet } from 'react-native';

/**
 * `pointerEvents` as compiled styles — always use these instead of writing
 * `pointerEvents` into an inline style object.
 *
 * react-native-web implements `box-none` / `box-only` (the view and its
 * children behave differently) only for styles created with
 * `StyleSheet.create`, which it compiles to a rule for the element plus a
 * `> *` rule for its children. In an inline style object the value is passed
 * straight to the DOM, where `pointer-events: box-none` is invalid CSS and
 * ignored — so the view silently captures every pointer event. A full-screen
 * overlay container then blocks the whole page.
 */
export const pointerEventsStyles = StyleSheet.create({
  /** The view ignores the pointer; its children still receive it. */
  boxNone: { pointerEvents: 'box-none' },
  /** The view receives the pointer; its children don't. */
  boxOnly: { pointerEvents: 'box-only' },
  /** Neither the view nor its children receive the pointer. */
  none: { pointerEvents: 'none' },
  auto: { pointerEvents: 'auto' },
});
