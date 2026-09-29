import React from 'react';
import { act, render, renderHook } from '@testing-library/react-native';
import { Dimensions, Text, View } from 'react-native';

import { DEFAULT_THEME } from '../../theme/defaultTheme';
import { PlatformBlocksThemeProvider } from '../../theme/ThemeProvider';
import { getBuiltInTheme } from '../../theme/utils';
import { resetViewportStore } from '../../responsive/viewportStore';
import { factory, withStatics } from '../factory';
import { isHiddenBy, useVisibility } from '../visibility';

type ChangeHandler = () => void;
let size = { width: 1000, height: 800 };
let handlers: ChangeHandler[] = [];

beforeEach(() => {
  resetViewportStore();
  size = { width: 1000, height: 800 };
  handlers = [];
  jest.spyOn(Dimensions, 'get').mockImplementation(() => ({ ...size, scale: 2, fontScale: 1 }));
  jest.spyOn(Dimensions, 'addEventListener').mockImplementation(((_type: string, handler: ChangeHandler) => {
    handlers.push(handler);
    return { remove: () => { handlers = handlers.filter((h) => h !== handler); } };
  }) as never);
});

afterEach(() => {
  jest.restoreAllMocks();
  resetViewportStore();
});

const resize = (width: number) => {
  size = { width, height: 800 };
  act(() => handlers.forEach((handler) => handler()));
};

interface BoxProps {
  label?: string;
  testID?: string;
  onRender?: (props: Record<string, unknown>) => void;
}

const Box = factory<{ props: BoxProps; ref: View }>((props, ref) => {
  props.onRender?.(props as Record<string, unknown>);
  return (
    <View ref={ref} testID={props.testID}>
      <Text>{props.label ?? 'box'}</Text>
    </View>
  );
}, { displayName: 'Box' });

const dark = getBuiltInTheme('dark');
const inScheme = (scheme: 'light' | 'dark', node: React.ReactElement) => (
  <PlatformBlocksThemeProvider theme={scheme === 'dark' ? dark : DEFAULT_THEME}>{node}</PlatformBlocksThemeProvider>
);

describe('factory visibility props', () => {
  it('hides per color scheme', () => {
    expect(render(inScheme('light', <Box testID="b" lightHidden />)).queryByTestId('b')).toBeNull();
    expect(render(inScheme('dark', <Box testID="b" lightHidden />)).queryByTestId('b')).not.toBeNull();
    expect(render(inScheme('dark', <Box testID="b" darkHidden />)).queryByTestId('b')).toBeNull();
    expect(render(inScheme('light', <Box testID="b" darkHidden />)).queryByTestId('b')).not.toBeNull();
  });

  it('hiddenFrom hides at and above the breakpoint', () => {
    size = { width: 767, height: 800 }; // sm
    const view = render(<Box testID="b" hiddenFrom="md" />);
    expect(view.queryByTestId('b')).not.toBeNull();
    resize(768); // md
    expect(view.queryByTestId('b')).toBeNull();
    resize(1300); // xl
    expect(view.queryByTestId('b')).toBeNull();
    resize(500); // xs
    expect(view.queryByTestId('b')).not.toBeNull();
  });

  it('visibleFrom shows only at and above the breakpoint', () => {
    size = { width: 500, height: 800 }; // xs
    const view = render(<Box testID="b" visibleFrom="lg" />);
    expect(view.queryByTestId('b')).toBeNull();
    resize(991);
    expect(view.queryByTestId('b')).toBeNull();
    resize(992);
    expect(view.queryByTestId('b')).not.toBeNull();
  });

  it('strips visibility props before the component sees them', () => {
    const seen: Record<string, unknown>[] = [];
    render(
      <Box
        onRender={(props) => seen.push(props)}
        lightHidden={false}
        darkHidden={undefined}
        hiddenFrom="xl"
        testID="b"
      />
    );
    expect(seen.length).toBeGreaterThan(0);
    for (const props of seen) {
      expect(props).not.toHaveProperty('lightHidden');
      expect(props).not.toHaveProperty('darkHidden');
      expect(props).not.toHaveProperty('hiddenFrom');
      expect(props).not.toHaveProperty('visibleFrom');
    }
  });

  it('does not subscribe to the viewport when no breakpoint prop is set', () => {
    render(<Box testID="b" />);
    render(inScheme('dark', <Box testID="c" lightHidden />));
    expect(handlers).toHaveLength(0);
  });

  it('survives visibility props being toggled on and off (hook-order safe)', () => {
    size = { width: 1300, height: 800 };
    const view = render(<Box testID="b" />);
    expect(view.queryByTestId('b')).not.toBeNull();
    view.rerender(<Box testID="b" hiddenFrom="md" />);
    expect(view.queryByTestId('b')).toBeNull();
    view.rerender(<Box testID="b" hiddenFrom={undefined} />);
    expect(view.queryByTestId('b')).not.toBeNull();
    view.rerender(<Box testID="b" visibleFrom="md" />);
    expect(view.queryByTestId('b')).not.toBeNull();
  });

  it('forwards refs', () => {
    const ref = React.createRef<View>();
    render(<Box ref={ref} testID="b" hiddenFrom="xl" />);
    expect(ref.current).not.toBeNull();
  });
});

describe('displayName', () => {
  it('is set on the (memoized) component it returns', () => {
    expect(Box.displayName).toBe('Box');
    const Plain = factory<{ props: BoxProps; ref: View }>((props, ref) => <View ref={ref} />, {
      displayName: 'Plain',
      memo: false,
    });
    expect(Plain.displayName).toBe('Plain');
  });

  it('falls back to the render function name', () => {
    const Named = factory<{ props: BoxProps; ref: View }>(function NamedBox(_props, ref) {
      return <View ref={ref} />;
    });
    expect(Named.displayName).toBe('NamedBox');
  });

  it('is set on withProps results', () => {
    const Labeled = Box.withProps({ label: 'preset' });
    expect(Labeled.displayName).toBe('WithProps(Box)');
    const NotMemo = factory<{ props: BoxProps; ref: View }>((_props, ref) => <View ref={ref} />, {
      displayName: 'NotMemo',
      memo: false,
    }).withProps({ label: 'x' });
    expect(NotMemo.displayName).toBe('WithProps(NotMemo)');
  });
});

describe('withProps / extend / withStatics', () => {
  it('pre-sets props that the call site can override, keeping visibility support', () => {
    const Labeled = Box.withProps({ label: 'preset' });
    const view = render(<Labeled testID="b" />);
    expect(view.getByText('preset')).toBeTruthy();
    expect(render(<Labeled label="override" />).getByText('override')).toBeTruthy();
    expect(render(inScheme('light', <Labeled testID="h" lightHidden />)).queryByTestId('h')).toBeNull();
    const Twice = Labeled.withProps({ testID: 'twice' });
    expect(render(<Twice />).getByTestId('twice')).toBeTruthy();
    expect(render(<Twice />).getByText('preset')).toBeTruthy();
  });

  it('extend is a typed identity', () => {
    const input = { defaultProps: { label: 'x' } };
    expect(Box.extend(input)).toBe(input);
  });

  it('withStatics attaches compound members', () => {
    const Item = factory<{ props: BoxProps; ref: View }>((props, ref) => <View ref={ref} testID={props.testID} />);
    const Compound = withStatics(Box, { Item });
    expect(Compound.Item).toBe(Item);
    expect(render(<Compound.Item testID="item" />).getByTestId('item')).toBeTruthy();
  });
});

describe('useVisibility', () => {
  it('evaluates the rules for non-factory components', () => {
    size = { width: 400, height: 800 };
    const { result } = renderHook(() => useVisibility({ visibleFrom: 'sm' }));
    expect(result.current).toBe(false);
    resize(600);
    expect(result.current).toBe(true);
  });

  it('isHiddenBy matches Mantine semantics', () => {
    expect(isHiddenBy({ hiddenFrom: 'md' }, 'light', 'md')).toBe(true);
    expect(isHiddenBy({ hiddenFrom: 'md' }, 'light', 'sm')).toBe(false);
    expect(isHiddenBy({ visibleFrom: 'md' }, 'light', 'lg')).toBe(false);
    expect(isHiddenBy({ visibleFrom: 'md' }, 'light', 'base')).toBe(true);
    expect(isHiddenBy({}, 'dark', 'xl')).toBe(false);
  });
});
