import { QRMode } from './tables';

export function detectMode(data: string): QRMode {
  if (/^\d+$/.test(data)) {
    return 'NUMERIC';
  }
  if (/^[0-9A-Z $%*+\-.\/:]+$/.test(data)) {
    return 'ALPHANUMERIC';
  }
  return 'BYTE';
}

export const ALPHANUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

export function stringToUtf8Bytes(data: string): number[] {
  if (typeof TextEncoder !== 'undefined') {
    return Array.from(new TextEncoder().encode(data));
  }
  const bytes: number[] = [];
  for (let i = 0; i < data.length; i++) {
    let codePoint = data.charCodeAt(i);
    if (codePoint < 0x80) {
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      bytes.push(0xc0 | (codePoint >> 6));
      bytes.push(0x80 | (codePoint & 0x3f));
    } else if (codePoint >= 0xd800 && codePoint <= 0xdbff) {
      const next = data.charCodeAt(i + 1);
      if (Number.isNaN(next)) {
        bytes.push(0xef, 0xbf, 0xbd);
        continue;
      }
      const surrogatePair = ((codePoint - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
      i++;
      bytes.push(
        0xf0 | (surrogatePair >> 18),
        0x80 | ((surrogatePair >> 12) & 0x3f),
        0x80 | ((surrogatePair >> 6) & 0x3f),
        0x80 | (surrogatePair & 0x3f)
      );
    } else if (codePoint >= 0xdc00 && codePoint <= 0xdfff) {
      bytes.push(0xef, 0xbf, 0xbd);
    } else {
      bytes.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    }
  }
  return bytes;
}

export function encodeData(data: string, mode: QRMode, byteData?: number[]): number[] {
  const bits: number[] = [];
  if (mode === 'NUMERIC') {
    for (let i=0;i<data.length;i+=3){
      const chunk = data.substring(i,i+3);
      const len = chunk.length;
      const v = parseInt(chunk,10);
      const bitLen = len===3?10: len===2?7:4;
      pushBits(bits,v,bitLen);
    }
  } else if (mode === 'ALPHANUMERIC') {
    for (let i=0;i<data.length;i+=2){
      if (i+1 < data.length){
        const v = ALPHANUM.indexOf(data[i])*45 + ALPHANUM.indexOf(data[i+1]);
        pushBits(bits,v,11);
      } else {
        pushBits(bits,ALPHANUM.indexOf(data[i]),6);
      }
    }
  } else { // BYTE (ISO-8859-1 subset / UTF-16 code units truncated)
    const bytes = byteData ?? stringToUtf8Bytes(data);
    for (let i = 0; i < bytes.length; i++) {
      pushBits(bits, bytes[i], 8);
    }
  }
  return bits;
}

export function pushBits(out:number[], value:number, length:number){
  for (let i=length-1;i>=0;i--){
    out.push( (value >> i) & 1 );
  }
}
