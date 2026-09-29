import type { KeyboardEventLike } from '../keyboard';

/** A minimal keyboard event whose preventDefault is observable. */
export function keyEvent(key: string, extra: Partial<KeyboardEventLike> = {}) {
  const event = {
    key,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ...extra,
  };
  return event as KeyboardEventLike & { preventDefault: jest.Mock; stopPropagation: jest.Mock };
}
