import React, { forwardRef, memo } from 'react';

import type { VisibilityProps } from '../types/base';
import { VisibilityGate, hasVisibilityProps } from './visibility';

type UnknownProps = Record<string, unknown>;

/**
 * Base factory payload interface.
 *
 * `staticComponents` declares compound members (`Menu.Item`, …) so the
 * factory's return type includes them; attach them with `withStatics`.
 */
export interface FactoryPayload {
  props: object;
  ref: unknown;
  staticComponents?: object;
}

/** The statics a payload declares (`unknown` — i.e. nothing — when it declares none). */
export type FactoryStatics<Payload> = Payload extends { staticComponents: infer S }
  ? S extends object
    ? S
    : unknown
  : unknown;

/** Props of a component after `withProps(fixed)`: the fixed ones become optional. */
export type WithFixedProps<Props, Fixed> = Omit<Props, keyof Fixed> &
  Partial<Pick<Props, Extract<keyof Fixed, keyof Props>>>;

/** Input accepted by a component's `extend` (theme component overrides). */
export interface FactoryExtendInput<Props> {
  defaultProps?: Partial<Props>;
  [key: string]: unknown;
}

// Component with static properties
export interface ComponentWithProps<Props = UnknownProps, RefType = unknown> {
  /**
   * A copy of the component with some props pre-set. The pre-set props become
   * optional on the result, and props passed at the call site win.
   */
  withProps: <T extends Partial<Props>>(
    fixedProps: T
  ) => PlatformBlocksComponent<{ props: WithFixedProps<Props, T>; ref: RefType }>;
}

export interface PlatformBlocksComponent<Payload extends FactoryPayload>
  extends React.ForwardRefExoticComponent<
      React.PropsWithoutRef<Payload['props'] & VisibilityProps> & React.RefAttributes<Payload['ref']>
    >,
    ComponentWithProps<Payload['props'], Payload['ref']> {
  /** Typed identity for theme component overrides: `Button.extend({ defaultProps: { … } })`. */
  extend: <T extends FactoryExtendInput<Payload['props']>>(input: T) => T;
  displayName?: string;
}

/** What `factory` returns: the component plus any statics its payload declares. */
export type FactoryComponent<Payload extends FactoryPayload> = PlatformBlocksComponent<Payload> &
  FactoryStatics<Payload>;

/**
 * Factory function for creating PlatformBlocks components
 */
export interface FactoryOptions<Payload extends FactoryPayload> {
  /**
   * Optional display name applied to the resulting component. If omitted, React will infer the name.
   */
  displayName?: string;
  /**
   * Enable or disable memoization. Defaults to `true`.
   */
  memo?: boolean;
  /**
   * Optional custom comparison used when memoization is enabled.
   */
  arePropsEqual?: (
    prevProps: Readonly<Payload['props']>,
    nextProps: Readonly<Payload['props']>
  ) => boolean;
}

const identity = <T,>(input: T): T => input;

/**
 * The components the factory builds internally, with their props erased to a
 * plain record: the public `FactoryComponent<Payload>` type is applied once, on
 * the way out of `factory`.
 */
type AnyForwardRef = React.ForwardRefExoticComponent<UnknownProps & React.RefAttributes<unknown>>;
type PropsComparator = (prev: Readonly<UnknownProps>, next: Readonly<UnknownProps>) => boolean;
/** What `attachHelpers` writes onto a (possibly memoized) component. */
interface HelperHost {
  displayName?: string;
  extend?: <T>(input: T) => T;
  withProps?: (fixedProps: UnknownProps) => HelperHost;
}

/**
 * Strips the visibility props (whether set or explicitly `undefined`/`false`)
 * so they never reach the component or its host element.
 */
function withoutVisibility(props: Record<string, unknown>): Record<string, unknown> {
  if (
    !('lightHidden' in props) &&
    !('darkHidden' in props) &&
    !('hiddenFrom' in props) &&
    !('visibleFrom' in props)
  ) {
    return props;
  }
  const { lightHidden: _l, darkHidden: _d, hiddenFrom: _h, visibleFrom: _v, ...rest } = props;
  return rest;
}

/**
 * Wraps a forwardRef component so the visibility props are implemented once:
 * with none set, the component renders directly (no extra hooks run); with any
 * set, it renders through `VisibilityGate`, which returns `null` while hidden.
 *
 * Toggling a visibility prop between unset and set remounts the component (the
 * gate is inserted above it); a hidden component is unmounted anyway.
 */
function createVisibilityRoot(Inner: AnyForwardRef, name: string | undefined): AnyForwardRef {
  const Root = forwardRef<unknown, Record<string, unknown>>(function PlatformBlocksRoot(props, ref) {
    const rest = withoutVisibility(props);
    if (!hasVisibilityProps(props)) {
      return <Inner {...rest} ref={ref} />;
    }
    const { lightHidden, darkHidden, hiddenFrom, visibleFrom } = props as VisibilityProps;
    return (
      <VisibilityGate
        lightHidden={lightHidden}
        darkHidden={darkHidden}
        hiddenFrom={hiddenFrom}
        visibleFrom={visibleFrom}
      >
        <Inner {...rest} ref={ref} />
      </VisibilityGate>
    );
  }) as AnyForwardRef;
  if (name) Root.displayName = name;
  return Root;
}

function attachHelpers(
  component: HelperHost,
  target: AnyForwardRef,
  name: string,
  shouldMemo: boolean,
  arePropsEqual: PropsComparator | undefined
): void {
  component.extend = identity;
  component.withProps = (fixedProps: Record<string, unknown>) => {
    const Extended = forwardRef<unknown, Record<string, unknown>>((props, ref) =>
      React.createElement(target, { ...fixedProps, ...props, ref })
    ) as AnyForwardRef;
    Extended.displayName = `WithProps(${name})`;
    const Result: HelperHost = shouldMemo ? memo(Extended, arePropsEqual) : Extended;
    // `memo()` returns a new object, so name it too (`Comp.displayName` must be readable).
    Result.displayName = Extended.displayName;
    attachHelpers(Result, Extended, Extended.displayName, shouldMemo, arePropsEqual);
    return Result;
  };
}

/**
 * The component authoring API: forwardRef + displayName + visibility props
 * (`lightHidden`, `darkHidden`, `hiddenFrom`, `visibleFrom` — stripped before
 * `ui` sees them) + optional memo, plus typed `withProps` / `extend`.
 *
 * Generic components: build with `factory`, then cast to a generic call
 * signature (see `Wheel.tsx`). Compound members: declare them in the payload's
 * `staticComponents` and attach with `withStatics`.
 */
export function factory<Payload extends FactoryPayload>(
  ui: React.ForwardRefRenderFunction<Payload['ref'], Payload['props']>,
  options: FactoryOptions<Payload> = {}
): FactoryComponent<Payload> {
  const { displayName, memo: shouldMemo = true, arePropsEqual } = options;

  const Inner = forwardRef(ui) as unknown as AnyForwardRef;
  if (displayName) {
    Inner.displayName = displayName;
  }
  const inferredName = displayName || ui.displayName || ui.name || undefined;
  const name = inferredName || 'PlatformBlocksComponent';

  const Root = createVisibilityRoot(Inner, inferredName);

  // The comparator is written against the component's own props; the erased
  // components below compare the same objects.
  const compare = arePropsEqual as PropsComparator | undefined;
  const Component: HelperHost = shouldMemo ? memo(Root, compare) : Root;
  // `memo()` returns a new object whose `displayName` is unset; mirror the
  // name onto it so `Button.displayName` reads the same memoized or not.
  if (shouldMemo && inferredName) {
    Component.displayName = inferredName;
  }
  attachHelpers(Component, Root, name, shouldMemo, compare);

  return Component as FactoryComponent<Payload>;
}

/**
 * Attaches compound members to a component and returns the intersection type:
 *
 * ```ts
 * export const Menu = withStatics(MenuRoot, { Item: MenuItem, Label: MenuLabel });
 * <Menu.Item />
 * ```
 */
export function withStatics<C extends object, S extends Record<string, unknown>>(
  component: C,
  statics: S
): C & S {
  return Object.assign(component, statics);
}

// Helper type for creating factory interfaces
export type Factory<Payload extends FactoryPayload> = Payload;
