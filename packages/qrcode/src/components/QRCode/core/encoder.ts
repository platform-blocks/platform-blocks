import { VERSION_INFO, MODE_INDICATORS, getCharCountBits, QRMode, ECLvlInfo, MAX_VERSION } from './tables';
import { detectMode, encodeData, pushBits, stringToUtf8Bytes } from './mode';
import { generateECC } from './reedSolomon';

export interface EncodedQR {
  version: number;
  size: number;
  eccLevel: 'L'|'M'|'Q'|'H';
  dataBits: number[]; // final bit stream (without masking yet)
  dataCodewords: number[]; // bytes
  eccCodewords: number[]; // interleaved ECC codewords (across blocks)
  interleavedCodewords: number[]; // final sequence (data + ecc) interleaved per spec
  rawBits: number[]; // before padding
}

// Compute the number of data bits required (before padding to a byte boundary, excluding terminator truncation)
function computeDataBitLength(value: string, mode: QRMode, byteData?: number[]): number {
  if (mode === 'NUMERIC') {
    let bits = 0;
    for (let i = 0; i < value.length; i += 3) {
      const remaining = Math.min(3, value.length - i);
      bits += remaining === 3 ? 10 : remaining === 2 ? 7 : 4;
    }
    return bits;
  }
  if (mode === 'ALPHANUMERIC') {
    return Math.floor(value.length / 2) * 11 + (value.length % 2 === 1 ? 6 : 0);
  }
  const bytes = byteData ?? stringToUtf8Bytes(value);
  return bytes.length * 8;
}

export function chooseVersion(data: string, ecc: 'L'|'M'|'Q'|'H'): number {
  const mode: QRMode = detectMode(data);
  const byteData = mode === 'BYTE' ? stringToUtf8Bytes(data) : undefined;
  const dataBits = computeDataBitLength(data, mode, byteData);

  for (let v = 1; v <= MAX_VERSION; v++) {
    const versionInfo = VERSION_INFO[v];
    if (!versionInfo) continue;
    const info = versionInfo.ecc[ecc];
    const ccBits = getCharCountBits(v, mode);
    const baseBits = 4 + ccBits + dataBits; // mode + count + payload
    const capacityBits = info.totalDataCodewords * 8;
    let total = baseBits + Math.min(4, Math.max(0, capacityBits - baseBits));
    total += (8 - (total % 8)) % 8;
    // Remainder bits belong to the matrix after all data and ECC codewords.
    // They do not consume data capacity.
    if (total <= capacityBits) {
      return v;
    }
  }

  throw new Error(`QR Code value exceeds the capacity of version ${MAX_VERSION} at error correction level ${ecc}`);
}

export function encode(value: string, ecc: 'L'|'M'|'Q'|'H'): EncodedQR {
  const version = chooseVersion(value, ecc);
  const size = VERSION_INFO[version].size;
  const mode: QRMode = detectMode(value);
  const modeIndicator = MODE_INDICATORS[mode];
  const charCountBits = getCharCountBits(version, mode);
  const byteData = mode === 'BYTE' ? stringToUtf8Bytes(value) : undefined;
  const payloadBits = encodeData(value, mode, byteData);

  const ecInfo: ECLvlInfo = VERSION_INFO[version].ecc[ecc];
  const capacityBits = ecInfo.totalDataCodewords * 8;

  const bits: number[] = [];
  pushBits(bits, modeIndicator, 4);
  const charCountValue = mode === 'BYTE' ? (byteData ? byteData.length : 0) : value.length;
  pushBits(bits, charCountValue, charCountBits);
  bits.push(...payloadBits);
  // Terminator (up to 4 zeros, truncated if exceeding capacity)
  const remaining = capacityBits - bits.length;
  const terminatorLen = Math.min(4, Math.max(0, remaining));
  for (let i=0;i<terminatorLen;i++) bits.push(0);
  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Convert to codewords (data region)
  const dataCodewords: number[] = [];
  for (let i=0;i<bits.length && (i/8) < ecInfo.totalDataCodewords; i+=8) {
    let b=0; for (let j=0;j<8;j++) b=(b<<1)|bits[i+j];
    dataCodewords.push(b);
  }
  // Pad codewords 0xEC, 0x11 alternating until capacity
  const PAD0 = 0xEC, PAD1 = 0x11;
  let padToggle = true;
  while (dataCodewords.length < ecInfo.totalDataCodewords) {
    dataCodewords.push(padToggle ? PAD0 : PAD1);
    padToggle = !padToggle;
  }

  // Build RS blocks
  const blocks: { data: number[]; ecc: number[] }[] = [];
  const { group1, group2, ecCodewordsPerBlock } = ecInfo;
  let offset = 0;
  const buildGroup = (g?: {blocks:number; dataCodewords:number}) => {
    if (!g) return;
    for (let i=0;i<g.blocks;i++) {
      const slice = dataCodewords.slice(offset, offset + g.dataCodewords);
      offset += g.dataCodewords;
      const eccWords = generateECC(slice, ecCodewordsPerBlock);
      blocks.push({ data: slice, ecc: eccWords });
    }
  };
  buildGroup(group1);
  buildGroup(group2);

  // Interleave data codewords
  const interleavedData: number[] = [];
  const maxDataLen = Math.max(...blocks.map(b => b.data.length));
  for (let i=0;i<maxDataLen;i++) {
    for (const b of blocks) if (i < b.data.length) interleavedData.push(b.data[i]);
  }
  // Interleave ECC codewords
  const interleavedECC: number[] = [];
  for (let i=0;i<ecCodewordsPerBlock;i++) {
    for (const b of blocks) interleavedECC.push(b.ecc[i]);
  }
  const finalSeq = interleavedData.concat(interleavedECC);

  return {
    version,
    size,
    eccLevel: ecc,
    dataBits: bits,
    dataCodewords,
    eccCodewords: interleavedECC,
    interleavedCodewords: finalSeq,
    rawBits: bits
  };
}
