// Apply one of 8 QR mask patterns to data modules (reserved skipped)
// pattern indices follow spec:
// 0: (r + c) % 2 === 0
// 1: r % 2 === 0
// 2: c % 3 === 0
// 3: (r + c) % 3 === 0
// 4: ( (r/2)|0 + (c/3)|0 ) % 2 === 0
// 5: (r*c)%2 + (r*c)%3 === 0
// 6: ( (r*c)%2 + (r*c)%3 ) % 2 === 0
// 7: ( (r+c)%2 + (r*c)%3 ) % 2 === 0
export function applyMask(matrix:number[][], reserved:boolean[][], pattern:number){
  const size = matrix.length;
  for (let r=0;r<size;r++){
    for (let c=0;c<size;c++){
      if (reserved[r][c]) continue;
      if (shouldInvert(pattern,r,c)) matrix[r][c] ^= 1;
    }
  }
}

export function shouldInvert(pattern:number,r:number,c:number): boolean {
  switch(pattern){
    case 0: return (r + c) % 2 === 0;
    case 1: return r % 2 === 0;
    case 2: return c % 3 === 0;
    case 3: return (r + c) % 3 === 0;
    case 4: return ( (r>>1) + Math.floor(c/3) ) % 2 === 0;
    case 5: return ( (r*c)%2 + (r*c)%3 ) === 0;
    case 6: return ( ( (r*c)%2 + (r*c)%3 ) % 2 ) === 0;
    case 7: return ( ( (r+c)%2 + (r*c)%3 ) % 2 ) === 0;
    default: return false;
  }
}
