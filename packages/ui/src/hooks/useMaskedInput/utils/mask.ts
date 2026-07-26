/**
 * Pattern-based input masking with caret preservation.
 *
 * The engine is deliberately split into two phases, which is what makes it safe
 * to feed its own output back in on every keystroke:
 *
 *   1. `unmask` walks the input string *against the pattern*, consuming literals
 *      that the input reproduced and skipping anything that can't fill a slot.
 *      This is the part that has to tolerate the mask's own separators — a mask
 *      like `(000) 000-0000` contains a space, and a naive "strip punctuation"
 *      pass leaves that space in the payload where it fails the digit test and
 *      truncates everything after it.
 *   2. `layout` lays the extracted payload back into the pattern, recording the
 *      output index of every payload character so the caret can be re-derived
 *      rather than guessed from a string diff.
 *
 * Literal characters that are *also* valid slot characters (the `1` in
 * `+1 (000) 000-0000`) are inherently ambiguous — the engine resolves the common
 * case (see `unmask`) and warns in development. Prefer keeping fixed dial codes
 * outside the mask.
 */

export interface MaskDefinition {
  /** The mask pattern (e.g., '(000) 000-0000', '+00 000 000 0000') */
  mask: string;
  /** Placeholder character for unfilled positions */
  placeholderChar?: string;
  /** Whether to show the mask when input is empty */
  showMask?: boolean;
  /** Custom definitions for mask characters */
  definitions?: Record<string, RegExp>;
  /**
   * When `true` (the default) the value stops at the last filled slot, so no
   * dangling separators trail the caret. When `false` the full mask is always
   * rendered with `placeholderChar` in the unfilled slots.
   */
  lazy?: boolean;
}

export interface MaskResult {
  /** The masked/formatted value */
  value: string;
  /** The unmasked/raw value */
  unmaskedValue: string;
  /** Whether every slot in the mask is filled */
  isComplete: boolean;
  /** Caret position within `value` after formatting */
  cursorPosition: number;
}

// Default character definitions
const DEFAULT_DEFINITIONS: Record<string, RegExp> = {
  '0': /\d/,           // Any digit
  'a': /[a-zA-Z]/,     // Any letter
  '*': /[a-zA-Z0-9]/,  // Any alphanumeric
  '#': /\d/,           // Any digit (alternative)
};

/** `__DEV__` is a Metro global; guard it so web/SSR bundles don't blow up. */
const IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

interface PatternSlot {
  char: string;
  isFixed: boolean;
  regex?: RegExp;
}

interface LayoutResult {
  /** The formatted string. */
  value: string;
  /** `true` at each index of `value` that came from a mask literal. */
  isLiteral: boolean[];
  /** For payload character `n`, its index within `value`. */
  payloadIndex: number[];
}

/**
 * Creates a masking function for the given pattern.
 */
export function createMask(definition: MaskDefinition) {
  const {
    mask,
    placeholderChar = '_',
    showMask = false,
    definitions = {},
    lazy = true
  } = definition;

  const combinedDefinitions = { ...DEFAULT_DEFINITIONS, ...definitions };

  // Parse the mask to identify fixed and variable characters
  const pattern: PatternSlot[] = Array.from(mask).map(char =>
    combinedDefinitions[char]
      ? { char, isFixed: false, regex: combinedDefinitions[char] }
      : { char, isFixed: true }
  );

  const slotCount = pattern.reduce((total, slot) => (slot.isFixed ? total : total + 1), 0);

  if (IS_DEV) {
    // A literal that also matches a slot definition is ambiguous, but only once
    // real slots precede it: a leading `+1 ` prefix is resolvable (see the
    // `carriesPrefix` guard in `unmask`), whereas `000-1-000` is not.
    const firstSlot = pattern.findIndex(slot => !slot.isFixed);
    const ambiguous = pattern.findIndex(
      (slot, index) =>
        slot.isFixed &&
        firstSlot !== -1 &&
        index > firstSlot &&
        pattern.some(other => !other.isFixed && other.regex!.test(slot.char))
    );
    if (ambiguous !== -1) {
      console.warn(
        `[platform-blocks] createMask: the mask "${mask}" uses "${pattern[ambiguous].char}" at position ${ambiguous} as a literal, but that character also matches one of its own slots. Input at that position is ambiguous — move fixed separators of this kind outside the mask.`
      );
    }
  }

  /**
   * Phase 1 — pull the payload characters out of `input`, walking it against the
   * pattern so the mask's own literals are consumed rather than mistaken for
   * payload (or, worse, treated as invalid and used to truncate the rest).
   */
  function unmask(input: string): { payload: string; sourceIndex: number[] } {
    const payload: string[] = [];
    const sourceIndex: number[] = [];
    let inputIndex = 0;
    let patternIndex = 0;

    while (inputIndex < input.length && patternIndex < pattern.length) {
      const slot = pattern[patternIndex];
      const char = input[inputIndex];

      if (slot.isFixed) {
        // `inputIndex === 0 && patternIndex > 0` means we already skipped past
        // earlier literals without matching any of them, so this input does not
        // carry the mask's prefix — the character must be payload, not a literal
        // that happens to look alike. Without this, typing "1" into an empty
        // `+1 (000)…` field is swallowed by the literal `1`.
        const carriesPrefix = !(inputIndex === 0 && patternIndex > 0);
        if (char === slot.char && carriesPrefix) {
          inputIndex += 1;
        }
        patternIndex += 1;
        continue;
      }

      if (slot.regex!.test(char)) {
        payload.push(char);
        sourceIndex.push(inputIndex);
        inputIndex += 1;
        patternIndex += 1;
      } else {
        // Not valid for this slot (a separator the user typed, a stray letter).
        // Skip it and keep going rather than discarding the remaining input.
        inputIndex += 1;
      }
    }

    return { payload: payload.join(''), sourceIndex };
  }

  /**
   * Phase 2 — lay `payload` back into the pattern.
   */
  function layout(payload: string): LayoutResult {
    let value = '';
    const isLiteral: boolean[] = [];
    const payloadIndex: number[] = [];
    let payloadPos = 0;

    for (let i = 0; i < pattern.length; i += 1) {
      const slot = pattern[i];
      const exhausted = payloadPos >= payload.length;

      if (exhausted && lazy) {
        // Lazy: stop at the last filled slot so no separators trail the caret.
        break;
      }

      if (slot.isFixed) {
        value += slot.char;
        isLiteral.push(true);
        continue;
      }

      if (exhausted) {
        value += placeholderChar;
        isLiteral.push(true);
        continue;
      }

      value += payload[payloadPos];
      isLiteral.push(false);
      payloadIndex.push(value.length - 1);
      payloadPos += 1;
    }

    return { value, isLiteral, payloadIndex };
  }

  /** Caret position just after payload character `payloadBefore - 1`. */
  function caretAfter(payloadBefore: number, laid: LayoutResult): number {
    let caret = payloadBefore <= 0
      ? 0
      : (laid.payloadIndex[payloadBefore - 1] ?? laid.value.length - 1) + 1;

    // Never park the caret on a separator — step over any run of literals so the
    // next keystroke lands in a real slot.
    while (caret < laid.value.length && laid.isLiteral[caret]) {
      caret += 1;
    }

    return Math.max(0, Math.min(caret, laid.value.length));
  }

  function toResult(payload: string, laid: LayoutResult, caret: number): MaskResult {
    return {
      value: laid.value,
      unmaskedValue: payload,
      isComplete: payload.length === slotCount,
      cursorPosition: caret
    };
  }

  /**
   * Apply the mask to an input value. `inputValue` may be raw payload, an
   * already-formatted value, or anything in between.
   */
  function applyMask(
    inputValue: string,
    previousValue: string = '',
    cursorPos: number = inputValue.length
  ): MaskResult {
    const { payload, sourceIndex } = unmask(inputValue);
    const laid = layout(payload);
    const payloadBefore = sourceIndex.filter(index => index < cursorPos).length;
    return toResult(payload, laid, caretAfter(payloadBefore, laid));
  }

  /**
   * Get display value (with placeholders if showMask is true)
   */
  function getDisplayValue(value: string): string {
    if (!value && showMask) {
      return pattern.map(slot => (slot.isFixed ? slot.char : placeholderChar)).join('');
    }
    return applyMask(value).value;
  }

  /**
   * Process an input change, resolving it against the previous value so that
   * deleting a separator deletes the payload character in front of it.
   */
  function processInput(
    newValue: string,
    oldValue: string,
    selectionStart: number = newValue.length
  ): MaskResult {
    const next = applyMask(newValue, oldValue, selectionStart);

    if (newValue.length >= oldValue.length) {
      return next;
    }

    const previousPayload = unmask(oldValue).payload;
    if (next.unmaskedValue !== previousPayload || previousPayload.length === 0) {
      // A payload character was removed — the reformat above already reflects it.
      return next;
    }

    // Only a literal was deleted, which leaves the payload untouched. Backspace
    // over a separator should still delete something, so drop the payload
    // character immediately before the caret.
    const { sourceIndex } = unmask(newValue);
    const payloadBefore = sourceIndex.filter(index => index < selectionStart).length;
    const cut = Math.max(0, payloadBefore - 1);
    const reduced = previousPayload.slice(0, cut) + previousPayload.slice(cut + 1);
    const laid = layout(reduced);

    return toResult(reduced, laid, caretAfter(cut, laid));
  }

  return {
    applyMask,
    getDisplayValue,
    processInput,
    /** Extract just the payload characters from any input. */
    unmask: (input: string) => unmask(input).payload,
    /** Number of fillable slots in the mask. */
    slotCount,
    pattern,
    definition
  };
}

export type Mask = ReturnType<typeof createMask>;

/**
 * Phone number specific masking presets.
 *
 * The `*_WITH_COUNTRY` style presets embed a literal dial code, which the engine
 * resolves for the leading position but which still costs the user a keystroke of
 * ambiguity. Prefer a national mask plus a separate non-editable prefix — that is
 * what `PhoneInput` does.
 */
export const PHONE_MASKS = {
  US: createMask({
    mask: '(000) 000-0000',
    placeholderChar: '0',
    lazy: true
  }),
  US_WITH_COUNTRY: createMask({
    mask: '+1 (000) 000-0000',
    placeholderChar: '0',
    lazy: true
  }),
  UK: createMask({
    mask: '+44 0000 000 0000',
    placeholderChar: '0',
    lazy: true
  }),
  UK_NATIONAL: createMask({
    mask: '0000 000 0000',
    placeholderChar: '0',
    lazy: true
  }),
  INTERNATIONAL: createMask({
    mask: '+000 000 000 0000',
    placeholderChar: '0',
    lazy: true
  })
};

/**
 * Other useful mask presets
 */
export const COMMON_MASKS = {
  CREDIT_CARD: createMask({
    mask: '0000 0000 0000 0000',
    placeholderChar: '0',
    lazy: true
  }),
  DATE: createMask({
    mask: '00/00/0000',
    placeholderChar: '0',
    lazy: true
  }),
  SSN: createMask({
    mask: '000-00-0000',
    placeholderChar: '0',
    lazy: true
  }),
  ZIP_CODE: createMask({
    mask: '00000-0000',
    placeholderChar: '0',
    lazy: true
  })
};
