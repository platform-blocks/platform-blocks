import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Icon } from '../Icon';

// Icon/IconButton depend on these providers; stub them so we can render in isolation.
const mockTheme = {
  colorScheme: 'light',
  colors: {
    primary: ['#E6F4FF', '#CDE8FF', '#9CD3FF', '#6BBEFF', '#3AA9FF', '#1890FF', '#096DD9', '#0050B3'],
    secondary: ['#f5f5f5', '#e5e5e5', '#d4d4d4', '#b4b4b4', '#949494', '#757575', '#5c5c5c', '#404040'],
    gray: ['#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151'],
  },
  text: { primary: '#111', secondary: '#666', muted: '#999', disabled: '#aaa', onPrimary: '#fff' },
};
jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => mockTheme,
}));
jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({ isRTL: false }),
}));

// A spy icon component in the shape of a Tabler / external-library icon.
const spy = jest.fn();
const FakeIcon = (props: any) => {
  spy(props);
  return <Text testID="fake-icon">icon</Text>;
};

describe('Icon — external icon prop', () => {
  beforeEach(() => spy.mockClear());

  it('renders a component passed via `icon` with resolved size/color/stroke', () => {
    const { getByTestId } = render(
      <Icon icon={FakeIcon} size={20} color="#ff0000" stroke={2} />
    );
    expect(getByTestId('fake-icon')).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ size: 20, color: '#ff0000', strokeWidth: 2 })
    );
  });

  it('renders a React element passed via `icon` as-is', () => {
    const { getByTestId } = render(<Icon icon={<FakeIcon />} />);
    expect(getByTestId('fake-icon')).toBeTruthy();
  });

  it('resolves a registry name to a component-based (Tabler) icon', () => {
    // `check` is a Tabler-backed registry entry; it should render without warning.
    const { toJSON } = render(<Icon name="check" size={16} />);
    expect(toJSON()).toBeTruthy();
  });
});
