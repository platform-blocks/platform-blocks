// Reed-Solomon over GF(256) for QR Code
// Supports single-block ECC generation (multi-block interleaving handled upstream later)

const GF256 = new Array<number>(256);
const GF256_INV = new Array<number>(256);
const PRIMITIVE = 0x11d; // x^8 + x^4 + x^3 + x^2 + 1

(function init(){
  let x = 1;
  for (let i=0;i<255;i++) {
    GF256[i] = x;
    GF256_INV[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= PRIMITIVE;
  }
  GF256[255] = GF256[0];
})();

function gfMul(a:number,b:number): number {
  if (a===0 || b===0) return 0;
  return GF256[(GF256_INV[a] + GF256_INV[b]) % 255];
}

// Build generator polynomial of given degree (returned as coefficient array)
function buildGeneratorPoly(degree: number): number[] {
  // Polynomial with coefficients in ascending order (index 0 = constant term)
  let poly = [1];
  for (let i=0;i<degree;i++) {
    const term = [1, GF256[i]]; // (x + a^i) => coefficients [1, a^i]
    const next = new Array(poly.length + term.length - 1).fill(0);
    for (let a=0;a<poly.length;a++) {
      for (let b=0;b<term.length;b++) {
        next[a+b] ^= gfMul(poly[a], term[b]);
      }
    }
    poly = next; // degree increases by 1
  }
  return poly; // length degree+1
}

export function generateECC(data: number[], eccCount: number): number[] {
  const gen = buildGeneratorPoly(eccCount); // length eccCount+1, gen[0] = constant term
  const ecc = new Array(eccCount).fill(0);
  for (let i=0;i<data.length;i++) {
    const factor = data[i] ^ ecc[0];
    // shift left (drop first)
    for (let j=0;j<eccCount-1;j++) ecc[j] = ecc[j+1];
    ecc[eccCount-1] = 0;
    if (factor !== 0) {
      // gen coefficients ascending: g(x) = g0 + g1 x + ... + g_eccCount x^{eccCount}
      // We multiply factor * (g1..g_eccCount) XOR into ecc positions
      for (let j=0;j<eccCount;j++) {
        // use gen[j+1]
        ecc[j] ^= gfMul(factor, gen[j+1]);
      }
    }
  }
  return ecc;
}
