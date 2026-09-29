import { VERSION_INFO, REMAINDER_BITS } from './tables';
import { applyMask } from './mask';
import { EncodedQR } from './encoder';

// Build matrix with full functional patterns, proper zigzag placement, mask selection, format & version info.
export interface BuildResultMatrix { matrix: number[][]; mask: number; baseMatrix?: number[][]; maskScores?: number[]; }

export function buildMatrix(enc: EncodedQR): number[][];
export function buildMatrix(enc: EncodedQR, debug?: false): number[][];
export function buildMatrix(enc: EncodedQR, debug: true): BuildResultMatrix;
export function buildMatrix(enc: EncodedQR, debug = false): number[][] | BuildResultMatrix {
  const { size, version } = enc;
  const matrix = Array(size).fill(null).map(()=>Array(size).fill(0));
  const reserved = Array(size).fill(null).map(()=>Array(size).fill(false));

  // Finder patterns + separators
  placeFinder(matrix,reserved,0,0);
  placeFinder(matrix,reserved,0,size-7);
  placeFinder(matrix,reserved,size-7,0);

  // Timing patterns (row 6, col 6 between finders)
  for (let c=8;c<size-8;c++){ matrix[6][c] = (c%2===0)?1:0; reserved[6][c]=true; }
  for (let r=8;r<size-8;r++){ matrix[r][6] = (r%2===0)?1:0; reserved[r][6]=true; }

  // Alignment pattern centers for versions >=2 (simplified: use published sequence subset)
  const alignmentCenters = getAlignmentCenters(version);
  if (alignmentCenters.length){
    for (let i=0;i<alignmentCenters.length;i++){
      for (let j=0;j<alignmentCenters.length;j++){
        const r = alignmentCenters[i];
        const c = alignmentCenters[j];
        // Skip if overlaps finder
        if ((r<=6 && c<=6) || (r<=6 && c>=size-7) || (r>=size-7 && c<=6)) continue;
        placeAlignment(matrix,reserved,r,c);
      }
    }
  }

  // Reserve format info areas (will fill later). We'll mark their positions as reserved to protect from data placement.
  reserveFormatAreas(reserved,size);
  if (version >= 7) reserveVersionAreas(reserved,size);
  // Dark module (always black) – reserve now; set later after mask selection (spec) but before final output
  const darkRow = 4 * version + 9;
  if (darkRow < size) reserved[darkRow][8] = true;

  // Build bit stream from final interleaved codewords (data + ECC) then append remainder bits.
  const dataBits: number[] = [];
  const codewords = enc.interleavedCodewords || enc.dataCodewords.concat(enc.eccCodewords);
  codewords.forEach(b=>{ for (let i=7;i>=0;i--) dataBits.push( (b>>i)&1 ); });
  const rem = REMAINDER_BITS[version] || 0; for (let i=0;i<rem;i++) dataBits.push(0);

  // Canonical zigzag traversal: iterate column pairs, sweeping full column in current direction.
  let bitIndex = 0;
  let row = size - 1;
  let goingUp = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // skip timing column
    let reachedEdge = false;
    while (!reachedEdge) {
      for (let i = 0; i < 2; i++) {
        const c = col - i;
        const r = row;
        if (c < 0) continue;
        if (!reserved[r][c]) {
          matrix[r][c] = dataBits[bitIndex++] ?? 0;
        }
      }
      if (goingUp) {
        if (row === 0) { goingUp = false; reachedEdge = true; break; }
        row--;
      } else {
        if (row === size - 1) { goingUp = true; reachedEdge = true; break; }
        row++;
      }
    }
  }

  // Preserve base (unmasked) copies for mask trials
  const baseMatrix = matrix.map(r=>[...r]);
  const baseReserved = reserved.map(r=>[...r]);
  let bestMatrix = baseMatrix.map(r=>[...r]);
  let bestReserved = baseReserved.map(r=>[...r]);
  let bestScore = Infinity;
  let bestMask = 0;
  const scores: number[] = [];
  const forced = typeof process !== 'undefined' && process.env.QR_FORCE_MASK != null ? parseInt(process.env.QR_FORCE_MASK,10) : null;
  const maskRange = forced != null && forced>=0 && forced<=7 ? [forced] : [0,1,2,3,4,5,6,7];
  for (const m of maskRange){
    const testM = baseMatrix.map(r=>[...r]);
    const testRes = baseReserved.map(r=>[...r]);
    applyMask(testM,testRes,m);
    placeFormatInfo(testM,testRes,enc.eccLevel,m);
    const score = scoreMatrix(testM);
  scores[m] = score;
    if (score < bestScore || (score === bestScore && m < bestMask)){
      bestScore = score; bestMask = m; bestMatrix = testM; bestReserved = testRes; }
  }
  // Ensure format bits already placed in bestMatrix; if not (edge) place again
  placeFormatInfo(bestMatrix,bestReserved,enc.eccLevel,bestMask);
  // Apply dark module now (post mask & format) per spec ordering
  if (darkRow < size) bestMatrix[darkRow][8] = 1;
  if (version >= 7) placeVersionInfo(bestMatrix, bestReserved, version);
  return debug ? { matrix: bestMatrix, mask: bestMask, baseMatrix, maskScores: scores } : bestMatrix;
}

function placeFinder(m:number[][], res:boolean[][], row:number, col:number){
  for (let r=0;r<7;r++) for (let c=0;c<7;c++){
    const edge = r===0||r===6||c===0||c===6;
    const fill = r>=2&&r<=4&&c>=2&&c<=4;
    m[row+r][col+c] = edge||fill ? 1 : 0;
    res[row+r][col+c] = true;
  }
  // Separator (1 module white border if within bounds)
  for (let i=-1;i<=7;i++){
    markReserved(res,m,row-1,col+i);
    markReserved(res,m,row+7,col+i);
    markReserved(res,m,row+i,col-1);
    markReserved(res,m,row+i,col+7);
  }
}

function markReserved(res:boolean[][], m:number[][], r:number,c:number){
  if (r<0||c<0||r>=res.length||c>=res.length) return;
  res[r][c]=true; // keep value (default 0)
}

function placeAlignment(m:number[][], res:boolean[][], centerR:number, centerC:number){
  for (let r=-2;r<=2;r++) for (let c=-2;c<=2;c++){
    const R = centerR + r, C = centerC + c;
    if (R<0||C<0||R>=m.length||C>=m.length) continue;
    const dist = Math.max(Math.abs(r),Math.abs(c));
    m[R][C] = (dist===2 || dist===0) ? 1 : 0;
    res[R][C] = true;
  }
}

const ALIGNMENT_CENTER_TABLE: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
  11: [6, 30, 54],
  12: [6, 32, 58],
  13: [6, 34, 62],
  14: [6, 26, 46, 66],
  15: [6, 26, 48, 70],
  16: [6, 26, 50, 74],
  17: [6, 30, 54, 78],
  18: [6, 30, 56, 82],
  19: [6, 30, 58, 86],
  20: [6, 34, 62, 90],
  21: [6, 28, 50, 72, 94],
  22: [6, 26, 50, 74, 98],
  23: [6, 30, 54, 78, 102],
  24: [6, 28, 54, 80, 106],
  25: [6, 32, 58, 84, 110],
  26: [6, 30, 58, 86, 114],
  27: [6, 34, 62, 90, 118],
  28: [6, 26, 50, 74, 98, 122],
  29: [6, 30, 54, 78, 102, 126],
  30: [6, 26, 52, 78, 104, 130],
  31: [6, 30, 56, 82, 108, 134],
  32: [6, 34, 60, 86, 112, 138],
  33: [6, 30, 58, 86, 114, 142],
  34: [6, 34, 62, 90, 118, 146],
  35: [6, 30, 54, 78, 102, 126, 150],
  36: [6, 24, 50, 76, 102, 128, 154],
  37: [6, 28, 54, 80, 106, 132, 158],
  38: [6, 32, 58, 84, 110, 136, 162],
  39: [6, 26, 54, 82, 110, 138, 166],
  40: [6, 30, 58, 86, 114, 142, 170],
};

function getAlignmentCenters(version:number): number[] {
  return ALIGNMENT_CENTER_TABLE[version] || [];
}

// --- Format Information ---
// ECC level bits: L=01, M=00, Q=11, H=10
function eccLevelBits(l:'L'|'M'|'Q'|'H'): number {
  switch(l){
    case 'L': return 0b01;
    case 'M': return 0b00;
    case 'Q': return 0b11;
    case 'H': return 0b10;
  }
}

// Compute 15-bit format info: (ecc(2) + mask(3)) + BCH(10) then XOR 0x5412
export function computeFormatBits(level:'L'|'M'|'Q'|'H', maskPattern:number): number {
  const data = (eccLevelBits(level) << 3) | (maskPattern & 0b111); // 5 bits
  let v = data << 10; // append 10 zero bits
  const GP = 0b10100110111; // 0x537 generator
  for (let i = 14; i >= 10; i--) {
    if ((v >> i) & 1) {
      v ^= GP << (i - 10);
    }
  }
  const bch = v & 0x3FF; // 10 bits
  const format = ((data << 10) | bch) ^ 0x5412; // mask
  return format & 0x7FFF;
}

function placeFormatInfo(matrix:number[][], reserved:boolean[][], ecc:'L'|'M'|'Q'|'H', maskPattern:number){
  const size = matrix.length;
  const format = computeFormatBits(ecc, maskPattern);
  // bits MSB first index 0..14
  // Build bit array MSB->LSB then map to coordinates per spec order.
  const bits: number[] = []; for (let i=14;i>=0;i--) bits.push( (format>>i)&1 );
  // Reference library's top-left extraction sequence corresponded to a different ordering than ours; adjust mapping to match ref (observed mask pattern strings alignment).
  // Adjusted coordinate order derived by pairing bits pattern for mask index 3.
  const tlCoords: Array<[number,number]> = [
    [8,0],[8,1],[8,2],[8,3],[8,4],[8,5], // first 6 bits
    [8,7],[8,8],                         // skip timing module (8,6)
    [7,8],[6,8],[5,8],[4,8],[3,8],[2,8],[1,8] // vertical descending including timing earlier blank accounted
  ];
  // However spec vertical portion actually omits (6,8) because timing row; we erroneously include it above; fix by removing and using correct sequence
  const tl: Array<[number,number]> = [
    [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],
    [7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]
  ];
  const br: Array<[number,number]> = [
    [size-1,8],[size-2,8],[size-3,8],[size-4,8],[size-5,8],[size-6,8],[size-7,8],
    [8,size-8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1]
  ];
  for (let i=0;i<15;i++){ const [r,c]=tl[i]; matrix[r][c]=bits[i]; reserved[r][c]=true; }
  for (let i=0;i<15;i++){ const [r,c]=br[i]; matrix[r][c]=bits[i]; reserved[r][c]=true; }
}

// --- Version Information (versions >=7) ---
function computeVersionBits(version:number): number {
  // 6 bit version number + 12 bit error correction (Golay (18,6)) using generator 0b1111100100101
  let data = version & 0x3F; // 6 bits
  let v = data << 12; // append 12 zeros
  const GP = 0b1111100100101; // 13 bits (degree 12)
  for (let i = 17; i >= 12; i--) {
    if ((v >> i) & 1) {
      v ^= GP << (i - 12);
    }
  }
  const ec = v & 0xFFF; // 12 bits
  return (data << 12) | ec; // 18 bits
}

function placeVersionInfo(matrix:number[][], reserved:boolean[][], version:number) {
  const bits = computeVersionBits(version);
  const size = matrix.length;
  // Bit order: MSB first across 18 bits.
  for (let i=0;i<18;i++) {
    const bit = (bits >> i) & 1; // LSB-first iteration (i=0 is least). We'll map using spec pattern: we need MSB at specific positions.
  }
  // Proper mapping: Take 18 bits MSB->LSB into arrays
  const bitArray: number[] = []; for (let i=17;i>=0;i--) bitArray.push( (bits>>i)&1 );
  // Bottom-left: 6 rows x 3 cols above bottom-left finder (rows size-11..size-6, cols 0..2) in spec actually: rows 0..5 for top-right; for bottom-left it's columns 0..5 and rows size-11..size-9? Correct spec mapping:
  // Spec states: version info placed in two 3x6 areas. Bottom-left area: rows size-11..size-6, columns 0..2. Top-right area: rows 0..5, columns size-11..size-6.
  let k=0;
  for (let r=0; r<6; r++) {
    for (let c=0; c<3; c++) {
      const R = size - 11 + r; const C = c;
      matrix[R][C] = bitArray[k]; reserved[R][C]=true; k++; }
  }
  k=0;
  for (let r=0; r<6; r++) {
    for (let c=0; c<3; c++) {
      const R = r; const C = size - 11 + c;
      matrix[R][C] = bitArray[k]; reserved[R][C]=true; k++; }
  }
}

function reserveFormatAreas(res:boolean[][], size:number){
  const coords1: Array<[number,number]> = [
    [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]
  ];
  const coords2: Array<[number,number]> = [
    [size-1,8],[size-2,8],[size-3,8],[size-4,8],[size-5,8],[size-6,8],[size-7,8],
    [8,size-8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1]
  ];
  [...coords1,...coords2].forEach(([r,c])=>{ if (r>=0&&c>=0&&r<size&&c<size) res[r][c]=true; });
}

function reserveVersionAreas(res:boolean[][], size:number){
  for (let r=0;r<6;r++) for (let c=0;c<3;c++){ // top-right
    const R = r, C = size-11+c; res[R][C]=true;
  }
  for (let r=0;r<6;r++) for (let c=0;c<3;c++){ // bottom-left
    const R = size-11+r, C = c; res[R][C]=true;
  }
}

// --- Mask scoring (simplified penalty rules) ---
function scoreMatrix(m:number[][]): number {
  const size = m.length;
  let score = 0;
  // Rule 1: runs of same color
  for (let r=0;r<size;r++){
    let runColor = m[r][0]; let runLen=1;
    for (let c=1;c<size;c++){
      if (m[r][c]===runColor) {
        runLen++;
      } else {
        if (runLen>=5) score += 3 + (runLen - 5);
        runColor = m[r][c]; runLen = 1;
      }
    }
    if (runLen>=5) score += 3 + (runLen - 5);
  }
  for (let c=0;c<size;c++){
    let runColor = m[0][c]; let runLen=1;
    for (let r=1;r<size;r++){
      if (m[r][c]===runColor) {
        runLen++;
      } else {
        if (runLen>=5) score += 3 + (runLen - 5);
        runColor = m[r][c]; runLen = 1;
      }
    }
    if (runLen>=5) score += 3 + (runLen - 5);
  }
  // Rule 2: 2x2 blocks
  for (let r=0;r<size-1;r++) {
    for (let c=0;c<size-1;c++) {
      const v = m[r][c];
      if (m[r][c+1]===v && m[r+1][c]===v && m[r+1][c+1]===v) score += 3;
    }
  }
  // Rule 3: finder-like pattern 1:1:3:1:1 (dark-light-dark-dark-dark-light-dark) OR its inverse
  function checkFinderLike(seq:number[]) {
    for (let i=0;i<=seq.length-11;i++) {
      const a=seq[i],b=seq[i+1],c=seq[i+2],d=seq[i+3],e=seq[i+4],f=seq[i+5],g=seq[i+6];
      const forward = a===1&&b===0&&c===1&&d===1&&e===1&&f===0&&g===1;
      const inverse = a===0&&b===1&&c===0&&d===0&&e===0&&f===1&&g===0; // light-dark-light-light-light-dark-light
      if (forward||inverse){
        const leftOk = i>=4 && seq.slice(i-4,i).every(v=>v===0);
        const rightOk = i+11<=seq.length && seq.slice(i+7,i+11).every(v=>v===0);
        if (leftOk && rightOk) score += 40;
      }
    }
  }
  for (let r=0;r<size;r++) checkFinderLike(m[r]);
  for (let c=0;c<size;c++){ const col=[] as number[]; for (let r=0;r<size;r++) col.push(m[r][c]); checkFinderLike(col); }
  // Rule 4: dark ratio
  let dark=0; for (let r=0;r<size;r++) for (let c=0;c<size;c++) if (m[r][c]===1) dark++;
  const total = size*size;
  const percent = (dark*100)/total;
  const diff5 = Math.floor(Math.abs(percent - 50) / 5);
  score += diff5 * 10;
  return score;
}
