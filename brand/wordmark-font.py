"""
Builds apps/docs/public/fonts/plocks-wordmark.woff2, the font the docs site sets
the wordmark in as live text.

    python3 -m pip install fonttools brotli
    curl -LO 'https://github.com/google/fonts/raw/main/ofl/unbounded/Unbounded%5Bwght%5D.ttf'
    python3 brand/wordmark-font.py 'Unbounded[wght].ttf'

It pins Unbounded's weight axis at 600 (SemiBold), keeps only the six letters of
"plocks" and their kerning, and sets the ascent and descent to the l's ascender
(770) and the p's descender (165). With those metrics a line height of 0.935em is
exactly the glyphs' span, so the text centres on the mark the same way in every
browser — see apps/docs/components/layout/PlocksLogo.tsx.
"""
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ASCENT, DESCENT = 770, 165
OUT = Path(__file__).resolve().parent.parent / 'apps/docs/public/fonts/plocks-wordmark.woff2'

font = instancer.instantiateVariableFont(TTFont(sys.argv[1]), {'wght': 600})

options = subset.Options()
options.flavor = 'woff2'
options.hinting = False
options.layout_features = ['kern']
subsetter = subset.Subsetter(options)
subsetter.populate(text='plocks')
subsetter.subset(font)

hhea, os2 = font['hhea'], font['OS/2']
hhea.ascent, hhea.descent, hhea.lineGap = ASCENT, -DESCENT, 0
os2.sTypoAscender, os2.sTypoDescender, os2.sTypoLineGap = ASCENT, -DESCENT, 0
os2.usWinAscent, os2.usWinDescent = ASCENT, DESCENT

font.flavor = 'woff2'
font.save(OUT)
print(f'wrote {OUT} ({OUT.stat().st_size} bytes)')
