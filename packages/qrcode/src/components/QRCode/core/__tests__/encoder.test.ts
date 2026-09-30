import { encode, chooseVersion } from '../encoder';
import type { EncodedQR } from '../encoder';
import { buildMatrix } from '../buildMatrix';
import { VERSION_INFO, MODE_INDICATORS, getCharCountBits } from '../tables';

const bitsToInt = (bits: number[]) => bits.reduce((acc, bit) => (acc << 1) | bit, 0);

const countNonUndefined = (arr: Array<number | undefined>) => arr.filter((v) => typeof v === 'number').length;

describe('QRCode encoder math', () => {
  it('encodes numeric payloads with correct mode indicator and character count bits', () => {
    const value = '01234567';
    const result = encode(value, 'L');

    const modeBits = result.dataBits.slice(0, 4);
    expect(bitsToInt(modeBits)).toBe(MODE_INDICATORS.NUMERIC);

    const countBitsLen = getCharCountBits(result.version, 'NUMERIC');
    const countBits = result.dataBits.slice(4, 4 + countBitsLen);
    expect(bitsToInt(countBits)).toBe(value.length);
  });

  it('pads data codewords to capacity and interleaves ECC blocks', () => {
    const eccLevel = 'M' as const;
    const value = 'HELLO WORLD';
    const result = encode(value, eccLevel);
    const info = VERSION_INFO[result.version].ecc[eccLevel];

    expect(result.version).toBe(1);
    expect(result.dataCodewords).toHaveLength(info.totalDataCodewords);

    const totalBlocks = info.group1.blocks + (info.group2?.blocks ?? 0);
    const expectedECC = totalBlocks * info.ecCodewordsPerBlock;
    expect(result.eccCodewords).toHaveLength(expectedECC);
    expect(result.interleavedCodewords).toHaveLength(info.totalDataCodewords + expectedECC);

    // Tail bytes should follow the 0xEC/0x11 alternating pad sequence when capacity exceeds payload
    const tail = result.dataCodewords.slice(-2);
    expect(tail).toEqual([0xEC, 0x11]);
  });

  it('produces deterministic Reed-Solomon ECC words for HELLO WORLD at level M', () => {
    const result = encode('HELLO WORLD', 'M');
    expect(result.eccCodewords).toEqual([196, 35, 39, 119, 235, 215, 231, 226, 93, 23]);
  });

  it('escalates version numbers as payload size grows', () => {
    const short = chooseVersion('HELLO', 'M');
    const long = chooseVersion('HELLO'.repeat(40), 'M');
    expect(short).toBe(1);
    expect(long).toBeGreaterThan(short);
  });

  it('uses the full data capacity without charging matrix remainder bits to the payload', () => {
    expect(chooseVersion('A'.repeat(38), 'M')).toBe(2);
  });

  it('rejects data that exceeds the largest QR version instead of truncating it', () => {
    expect(() => encode('A'.repeat(5000), 'M')).toThrow(/exceeds the capacity/);
  });
});

describe('buildMatrix integration', () => {
  const expectedFinder = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];

  it('produces a valid matrix with finder patterns and dark module', () => {
    const enc = encode('HELLO WORLD', 'M');
    const { matrix, mask, maskScores } = buildMatrix(enc, true);

    const size = VERSION_INFO[enc.version].size;
    expect(matrix.length).toBe(size);
    expect(matrix.every((row) => row.length === size)).toBe(true);

    const topLeftFinder = matrix.slice(0, 7).map((row) => row.slice(0, 7));
    expect(topLeftFinder).toEqual(expectedFinder);

    const darkRow = 4 * enc.version + 9;
    if (darkRow < size) {
      expect(matrix[darkRow][8]).toBe(1);
    }

    expect(mask).toBeGreaterThanOrEqual(0);
    expect(mask).toBeLessThanOrEqual(7);
    expect(countNonUndefined(maskScores || [])).toBeGreaterThanOrEqual(8);

    // Matrix should strictly contain binary values
    matrix.forEach((row) => row.forEach((cell) => expect([0, 1]).toContain(cell)));
  });

  it('honors QR_FORCE_MASK environment override when provided', () => {
    const enc = encode('HELLO WORLD', 'M');
    const previous = process.env.QR_FORCE_MASK;
    process.env.QR_FORCE_MASK = '5';
    try {
      const { mask } = buildMatrix(enc, true);
      expect(mask).toBe(5);
    } finally {
      process.env.QR_FORCE_MASK = previous;
    }
  });

  it('places version information in both 3-by-6 areas for versions seven and above', () => {
    const enc = encode('B'.repeat(100), 'H');
    expect(enc.version).toBe(8);
    const matrix = buildMatrix(enc);
    const size = matrix.length;
    const versionBits = 0x085BC; // QR version 8 BCH code

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        const bit = (versionBits >> (i * 3 + j)) & 1;
        expect(matrix[size - 11 + j][i]).toBe(bit);
        expect(matrix[i][size - 11 + j]).toBe(bit);
      }
    }
  });
});

describe('mask scoring heuristics', () => {
  const createSyntheticEnc = (codewords: number[]): EncodedQR => ({
    version: 1,
    size: VERSION_INFO[1].size,
    eccLevel: 'M',
    dataBits: [],
    dataCodewords: [],
    eccCodewords: [],
    interleavedCodewords: codewords,
    rawBits: [],
  });

  const sum = (values: Array<number | undefined>): number =>
    values.reduce<number>((acc, value) => acc + (typeof value === 'number' ? value : 0), 0);

  it('penalizes dense patterns more than alternating streams', () => {
    const dense = createSyntheticEnc(new Array(64).fill(0xFF));
    const striped = createSyntheticEnc(Array.from({ length: 64 }, (_, idx) => (idx % 2 === 0 ? 0xFF : 0x00)));

    const denseScores = buildMatrix(dense, true).maskScores || [];
    const stripedScores = buildMatrix(striped, true).maskScores || [];

    expect(denseScores.length).toBeGreaterThanOrEqual(8);
    expect(stripedScores.length).toBeGreaterThanOrEqual(8);

    expect(sum(denseScores)).toBeGreaterThan(sum(stripedScores));
    expect(denseScores[2]).toBeGreaterThan(stripedScores[2]);
  });

  it('still evaluates all mask patterns even when interleaved codewords are synthetic', () => {
    const enc = createSyntheticEnc(new Array(64).fill(0x3C));
    const { maskScores } = buildMatrix(enc, true);
    expect(maskScores).toBeDefined();
    expect(maskScores?.filter(score => typeof score === 'number')).toHaveLength(8);
  });
});
