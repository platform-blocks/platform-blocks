// QR Code specification tables covering versions 1-40.
export interface ECBlockGroup { blocks: number; dataCodewords: number }
export interface ECLvlInfo {
  totalDataCodewords: number;
  ecCodewordsPerBlock: number;
  group1: ECBlockGroup;
  group2?: ECBlockGroup;
}
export interface VersionInfo { size: number; ecc: Record<'L' | 'M' | 'Q' | 'H', ECLvlInfo> }

// Remainder bits count per version. These bits are appended (as zeros) after all data + ECC codewords.
export const REMAINDER_BITS: Record<number, number> = {
  1: 0,
  2: 7,
  3: 7,
  4: 7,
  5: 7,
  6: 7,
  7: 0,
  8: 0,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0,
  17: 0,
  18: 0,
  19: 0,
  20: 0,
  21: 0,
  22: 0,
  23: 0,
  24: 0,
  25: 0,
  26: 0,
  27: 0,
  28: 0,
  29: 0,
  30: 0,
  31: 0,
  32: 0,
  33: 0,
  34: 0,
  35: 0,
  36: 0,
  37: 0,
  38: 0,
  39: 0,
  40: 0,
};

type ECCSpec = readonly [number, number, number, number, number?, number?];

const RAW_VERSION_DATA: ReadonlyArray<{
  version: number;
  levels: Record<'L' | 'M' | 'Q' | 'H', ECCSpec>;
}> = [
  {
    version: 1,
    levels: {
      L: [19, 7, 1, 19],
      M: [16, 10, 1, 16],
      Q: [13, 13, 1, 13],
      H: [9, 17, 1, 9],
    },
  },
  {
    version: 2,
    levels: {
      L: [34, 10, 1, 34],
      M: [28, 16, 1, 28],
      Q: [22, 22, 1, 22],
      H: [16, 28, 1, 16],
    },
  },
  {
    version: 3,
    levels: {
      L: [55, 15, 1, 55],
      M: [44, 26, 1, 44],
      Q: [34, 18, 2, 17],
      H: [26, 22, 2, 13],
    },
  },
  {
    version: 4,
    levels: {
      L: [80, 20, 1, 80],
      M: [64, 18, 2, 32],
      Q: [48, 26, 2, 24],
      H: [36, 16, 4, 9],
    },
  },
  {
    version: 5,
    levels: {
      L: [108, 26, 1, 108],
      M: [86, 24, 2, 43],
      Q: [62, 18, 2, 15, 2, 16],
      H: [46, 22, 2, 11, 2, 12],
    },
  },
  {
    version: 6,
    levels: {
      L: [136, 18, 2, 68],
      M: [108, 16, 4, 27],
      Q: [76, 24, 4, 19],
      H: [60, 28, 4, 15],
    },
  },
  {
    version: 7,
    levels: {
      L: [156, 20, 2, 78],
      M: [124, 18, 4, 31],
      Q: [88, 18, 2, 14, 4, 15],
      H: [66, 26, 4, 13, 1, 14],
    },
  },
  {
    version: 8,
    levels: {
      L: [194, 24, 2, 97],
      M: [154, 22, 2, 38, 2, 39],
      Q: [110, 22, 4, 18, 2, 19],
      H: [86, 26, 4, 14, 2, 15],
    },
  },
  {
    version: 9,
    levels: {
      L: [232, 30, 2, 116],
      M: [182, 22, 3, 36, 2, 37],
      Q: [132, 20, 4, 16, 4, 17],
      H: [100, 24, 4, 12, 4, 13],
    },
  },
  {
    version: 10,
    levels: {
      L: [274, 18, 2, 68, 2, 69],
      M: [216, 26, 4, 43, 1, 44],
      Q: [154, 24, 6, 19, 2, 20],
      H: [122, 28, 6, 15, 2, 16],
    },
  },
  {
    version: 11,
    levels: {
      L: [324, 20, 4, 81],
      M: [254, 30, 1, 50, 4, 51],
      Q: [180, 28, 4, 22, 4, 23],
      H: [140, 24, 3, 12, 8, 13],
    },
  },
  {
    version: 12,
    levels: {
      L: [370, 24, 2, 92, 2, 93],
      M: [290, 22, 6, 36, 2, 37],
      Q: [206, 26, 4, 20, 6, 21],
      H: [158, 28, 7, 14, 4, 15],
    },
  },
  {
    version: 13,
    levels: {
      L: [428, 26, 4, 107],
      M: [334, 22, 8, 37, 1, 38],
      Q: [244, 24, 8, 20, 4, 21],
      H: [180, 22, 12, 11, 4, 12],
    },
  },
  {
    version: 14,
    levels: {
      L: [461, 30, 3, 115, 1, 116],
      M: [365, 24, 4, 40, 5, 41],
      Q: [261, 20, 11, 16, 5, 17],
      H: [197, 24, 11, 12, 5, 13],
    },
  },
  {
    version: 15,
    levels: {
      L: [523, 22, 5, 87, 1, 88],
      M: [415, 24, 5, 41, 5, 42],
      Q: [295, 30, 5, 24, 7, 25],
      H: [223, 24, 11, 12, 7, 13],
    },
  },
  {
    version: 16,
    levels: {
      L: [589, 24, 5, 98, 1, 99],
      M: [453, 28, 7, 45, 3, 46],
      Q: [325, 24, 15, 19, 2, 20],
      H: [253, 30, 3, 15, 13, 16],
    },
  },
  {
    version: 17,
    levels: {
      L: [647, 28, 1, 107, 5, 108],
      M: [507, 28, 10, 46, 1, 47],
      Q: [367, 28, 1, 22, 15, 23],
      H: [283, 28, 2, 14, 17, 15],
    },
  },
  {
    version: 18,
    levels: {
      L: [721, 30, 5, 120, 1, 121],
      M: [563, 26, 9, 43, 4, 44],
      Q: [397, 28, 17, 22, 1, 23],
      H: [313, 28, 2, 14, 19, 15],
    },
  },
  {
    version: 19,
    levels: {
      L: [795, 28, 3, 113, 4, 114],
      M: [627, 26, 3, 44, 11, 45],
      Q: [445, 26, 17, 21, 4, 22],
      H: [341, 26, 9, 13, 16, 14],
    },
  },
  {
    version: 20,
    levels: {
      L: [861, 28, 3, 107, 5, 108],
      M: [669, 26, 3, 41, 13, 42],
      Q: [485, 30, 15, 24, 5, 25],
      H: [385, 28, 15, 15, 10, 16],
    },
  },
  {
    version: 21,
    levels: {
      L: [932, 28, 4, 116, 4, 117],
      M: [714, 26, 17, 42],
      Q: [512, 28, 17, 22, 6, 23],
      H: [406, 30, 19, 16, 6, 17],
    },
  },
  {
    version: 22,
    levels: {
      L: [1006, 28, 2, 111, 7, 112],
      M: [782, 28, 17, 46],
      Q: [568, 30, 7, 24, 16, 25],
      H: [442, 24, 34, 13],
    },
  },
  {
    version: 23,
    levels: {
      L: [1094, 30, 4, 121, 5, 122],
      M: [860, 28, 4, 47, 14, 48],
      Q: [614, 30, 11, 24, 14, 25],
      H: [464, 30, 16, 15, 14, 16],
    },
  },
  {
    version: 24,
    levels: {
      L: [1174, 30, 6, 117, 4, 118],
      M: [914, 28, 6, 45, 14, 46],
      Q: [664, 30, 11, 24, 16, 25],
      H: [514, 30, 30, 16, 2, 17],
    },
  },
  {
    version: 25,
    levels: {
      L: [1276, 26, 8, 106, 4, 107],
      M: [1000, 28, 8, 47, 13, 48],
      Q: [718, 30, 7, 24, 22, 25],
      H: [538, 30, 22, 15, 13, 16],
    },
  },
  {
    version: 26,
    levels: {
      L: [1370, 28, 10, 114, 2, 115],
      M: [1062, 28, 19, 46, 4, 47],
      Q: [754, 28, 28, 22, 6, 23],
      H: [596, 30, 33, 16, 4, 17],
    },
  },
  {
    version: 27,
    levels: {
      L: [1468, 30, 8, 122, 4, 123],
      M: [1128, 28, 22, 45, 3, 46],
      Q: [808, 30, 8, 23, 26, 24],
      H: [628, 30, 12, 15, 28, 16],
    },
  },
  {
    version: 28,
    levels: {
      L: [1531, 30, 3, 117, 10, 118],
      M: [1193, 28, 3, 45, 23, 46],
      Q: [871, 30, 4, 24, 31, 25],
      H: [661, 30, 11, 15, 31, 16],
    },
  },
  {
    version: 29,
    levels: {
      L: [1631, 30, 7, 116, 7, 117],
      M: [1267, 28, 21, 45, 7, 46],
      Q: [911, 30, 1, 23, 37, 24],
      H: [701, 30, 19, 15, 26, 16],
    },
  },
  {
    version: 30,
    levels: {
      L: [1735, 30, 5, 115, 10, 116],
      M: [1373, 28, 19, 47, 10, 48],
      Q: [985, 30, 15, 24, 25, 25],
      H: [745, 30, 23, 15, 25, 16],
    },
  },
  {
    version: 31,
    levels: {
      L: [1843, 30, 13, 115, 3, 116],
      M: [1455, 28, 2, 46, 29, 47],
      Q: [1033, 30, 42, 24, 1, 25],
      H: [793, 30, 23, 15, 28, 16],
    },
  },
  {
    version: 32,
    levels: {
      L: [1955, 30, 17, 115],
      M: [1541, 28, 10, 46, 23, 47],
      Q: [1115, 30, 10, 24, 35, 25],
      H: [845, 30, 19, 15, 35, 16],
    },
  },
  {
    version: 33,
    levels: {
      L: [2071, 30, 17, 115, 1, 116],
      M: [1631, 28, 14, 46, 21, 47],
      Q: [1171, 30, 29, 24, 19, 25],
      H: [901, 30, 11, 15, 46, 16],
    },
  },
  {
    version: 34,
    levels: {
      L: [2191, 30, 13, 115, 6, 116],
      M: [1725, 28, 14, 46, 23, 47],
      Q: [1231, 30, 44, 24, 7, 25],
      H: [961, 30, 59, 16, 1, 17],
    },
  },
  {
    version: 35,
    levels: {
      L: [2306, 30, 12, 121, 7, 122],
      M: [1812, 28, 12, 47, 26, 48],
      Q: [1286, 30, 39, 24, 14, 25],
      H: [986, 30, 22, 15, 41, 16],
    },
  },
  {
    version: 36,
    levels: {
      L: [2434, 30, 6, 121, 14, 122],
      M: [1914, 28, 6, 47, 34, 48],
      Q: [1354, 30, 46, 24, 10, 25],
      H: [1054, 30, 2, 15, 64, 16],
    },
  },
  {
    version: 37,
    levels: {
      L: [2566, 30, 17, 122, 4, 123],
      M: [1992, 28, 29, 46, 14, 47],
      Q: [1426, 30, 49, 24, 10, 25],
      H: [1096, 30, 24, 15, 46, 16],
    },
  },
  {
    version: 38,
    levels: {
      L: [2702, 30, 4, 122, 18, 123],
      M: [2102, 28, 13, 46, 32, 47],
      Q: [1502, 30, 48, 24, 14, 25],
      H: [1142, 30, 42, 15, 32, 16],
    },
  },
  {
    version: 39,
    levels: {
      L: [2812, 30, 20, 117, 4, 118],
      M: [2216, 28, 40, 47, 7, 48],
      Q: [1582, 30, 43, 24, 22, 25],
      H: [1222, 30, 10, 15, 67, 16],
    },
  },
  {
    version: 40,
    levels: {
      L: [2956, 30, 19, 118, 6, 119],
      M: [2334, 28, 18, 47, 31, 48],
      Q: [1666, 30, 34, 24, 34, 25],
      H: [1276, 30, 20, 15, 61, 16],
    },
  },
];

export const VERSION_INFO: Record<number, VersionInfo> = RAW_VERSION_DATA.reduce((acc, { version, levels }) => {
  const size = version * 4 + 17;
  const ecc = {} as Record<'L' | 'M' | 'Q' | 'H', ECLvlInfo>;
  (['L', 'M', 'Q', 'H'] as const).forEach(level => {
    const spec = levels[level];
    const [totalData, ecPerBlock, g1Blocks, g1Data, g2Blocks = 0, g2Data = 0] = spec;
    ecc[level] = {
      totalDataCodewords: totalData,
      ecCodewordsPerBlock: ecPerBlock,
      group1: { blocks: g1Blocks, dataCodewords: g1Data },
      ...(g2Blocks > 0 ? { group2: { blocks: g2Blocks, dataCodewords: g2Data } } : {}),
    };
  });
  acc[version] = { size, ecc };
  return acc;
}, {} as Record<number, VersionInfo>);

export const MAX_VERSION = Math.max(...Object.keys(VERSION_INFO).map(version => Number(version)));

export const MODE_INDICATORS = { NUMERIC: 0b0001, ALPHANUMERIC: 0b0010, BYTE: 0b0100 } as const;
export type QRMode = keyof typeof MODE_INDICATORS;

export function getCharCountBits(version: number, mode: QRMode): number {
  if (mode === 'NUMERIC') return version < 10 ? 10 : version < 27 ? 12 : 14;
  if (mode === 'ALPHANUMERIC') return version < 10 ? 9 : version < 27 ? 11 : 13;
  return version < 10 ? 8 : version < 27 ? 16 : 16;
}
