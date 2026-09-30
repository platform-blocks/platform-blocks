import { AccessibilityInfo } from 'react-native';
import { renderHook } from '@testing-library/react';
import { useScreenReaderEnabled } from '../context';

it('does not use react-native-web’s always-true screen reader stub', () => {
  const query = jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled');
  const { result } = renderHook(() => useScreenReaderEnabled());
  expect(result.current).toBe(false);
  expect(query).not.toHaveBeenCalled();
  query.mockRestore();
});
