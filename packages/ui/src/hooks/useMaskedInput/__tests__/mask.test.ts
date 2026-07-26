import { createMask } from '../utils/mask';

const usMask = () => createMask({ mask: '(000) 000-0000', placeholderChar: '_', lazy: true });

/** Feed keystrokes in one at a time, the way a field actually drives the mask. */
const typeAll = (mask: ReturnType<typeof createMask>, keys: string) => {
  let value = '';
  for (const key of keys) {
    value = mask.processInput(value + key, value, (value + key).length).value;
  }
  return value;
};

describe('createMask', () => {
  describe('unmasking its own output', () => {
    // Regression: the previous engine stripped punctuation but kept whitespace,
    // so the space in '(555) 000-0000' failed the digit test and truncated
    // everything after it — the field could never take a 4th digit.
    it('accepts input past a separator in the mask', () => {
      expect(usMask().applyMask('(555) 1').unmaskedValue).toBe('5551');
    });

    it('round-trips a fully formatted value', () => {
      expect(usMask().applyMask('(555) 123-4567').unmaskedValue).toBe('5551234567');
    });

    it('formats raw digits', () => {
      expect(usMask().applyMask('5551234567').value).toBe('(555) 123-4567');
    });

    it('types all ten digits', () => {
      expect(typeAll(usMask(), '5551234567')).toBe('(555) 123-4567');
    });

    it('ignores input past the last slot', () => {
      const mask = usMask();
      expect(mask.processInput('(555) 123-45678', '(555) 123-4567', 15).value)
        .toBe('(555) 123-4567');
    });
  });

  describe('lazy output', () => {
    it('stops at the last filled slot rather than trailing a separator', () => {
      expect(usMask().applyMask('555').value).toBe('(555');
      expect(usMask().applyMask('5551').value).toBe('(555) 1');
    });

    it('renders placeholders for every slot when not lazy', () => {
      const eager = createMask({ mask: '(000) 000-0000', placeholderChar: '_', lazy: false });
      expect(eager.applyMask('555').value).toBe('(555) ___-____');
    });

    it('shows the bare mask when showMask is set and input is empty', () => {
      const shown = createMask({ mask: '00/00', placeholderChar: '_', showMask: true });
      expect(shown.getDisplayValue('')).toBe('__/__');
    });
  });

  describe('caret', () => {
    it('never parks on a separator', () => {
      // 6 digits fills '(555) 123'; the caret belongs after the last digit.
      expect(usMask().applyMask('555123').cursorPosition).toBe(9);
    });

    it('follows a digit inserted mid-string', () => {
      const result = usMask().processInput('(5559) 123-4567', '(555) 123-4567', 5);
      expect(result.value).toBe('(555) 912-3456');
      expect(result.unmaskedValue).toBe('5559123456');
      // The inserted 9 lands at index 6, so the caret sits just after it.
      expect(result.cursorPosition).toBe(7);
    });

    it('stays put when a digit is deleted mid-string', () => {
      const result = usMask().processInput('(555) 23-4567', '(555) 123-4567', 6);
      expect(result.value).toBe('(555) 234-567');
      expect(result.cursorPosition).toBe(6);
    });
  });

  describe('deletion', () => {
    it('removes a digit', () => {
      expect(usMask().processInput('(555) 123-456', '(555) 123-4567', 13).unmaskedValue)
        .toBe('555123456');
    });

    // Deleting a separator leaves the payload untouched, so backspace has to
    // fall through to the digit in front of it or it appears to do nothing.
    it('deleting a separator removes the digit before it', () => {
      expect(usMask().processInput('(555)123-4567', '(555) 123-4567', 5).unmaskedValue)
        .toBe('551234567');
    });

    it('empties out', () => {
      expect(usMask().processInput('(', '(5', 1).value).toBe('');
    });
  });

  describe('completeness', () => {
    it('reports slot fill', () => {
      expect(usMask().applyMask('555123').isComplete).toBe(false);
      expect(usMask().applyMask('5551234567').isComplete).toBe(true);
    });

    it('exposes the slot count', () => {
      expect(usMask().slotCount).toBe(10);
    });
  });

  describe('literal handling', () => {
    it('keeps a trailing literal group reachable', () => {
      const ext = createMask({ mask: '000-000-0000 x0000', placeholderChar: '_', lazy: true });
      expect(typeAll(ext, '55512345671234')).toBe('555-123-4567 x1234');
      expect(ext.unmask('555-123-4567 x1234')).toBe('55512345671234');
    });

    it('treats a leading literal digit as payload on the first keystroke', () => {
      // '+1 (000)…' embeds a literal 1. Typing '1' into an empty field means the
      // digit, not the literal — otherwise the keystroke vanishes.
      const withDial = createMask({ mask: '+1 (000) 000-0000', placeholderChar: '0', lazy: true });
      expect(withDial.applyMask('1').unmaskedValue).toBe('1');
      expect(withDial.applyMask('5').value).toBe('+1 (5');
      expect(typeAll(withDial, '5551234567')).toBe('+1 (555) 123-4567');
    });
  });

  it.each([
    ['(00) 00000-0000', 11],
    ['00 00 00 00 00', 10],
    ['00-0000-0000', 10],
    ['000 000 000 000 000', 15],
    ['0000 0000 0000 0000', 16]
  ])('types cleanly through %s', (pattern, slots) => {
    const mask = createMask({ mask: pattern, placeholderChar: '_', lazy: true });
    const digits = '9'.repeat(slots);
    expect(mask.slotCount).toBe(slots);
    expect(typeAll(mask, digits)).toBe(mask.applyMask(digits).value);
    expect(mask.applyMask(digits).isComplete).toBe(true);
  });
});
