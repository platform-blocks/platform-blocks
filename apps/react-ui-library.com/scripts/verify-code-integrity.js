#!/usr/bin/env node
/**
 * Quick integrity check ensuring demo code strings in docs.json
 * match those emitted into sourceCodeMap.ts. Helps catch truncation
 * or serialization issues that could cause stray fragments to leak.
 */
const fs = require('fs');
const path = require('path');

function loadDocsJson() {
  const p = path.join(__dirname, '../data/docs.json');
  const raw = fs.readFileSync(p, 'utf8');
  const json = JSON.parse(raw);
  const map = {};
  json.components.forEach(c => {
    (c.demos || []).forEach(d => {
      const key = `${c.name}.demo.${d.id}`;
      map[key] = d.code;
    });
  });
  return map;
}

function loadSourceCodeMapTS() {
  const p = path.join(__dirname, '../data/sourceCodeMap.ts');
  const raw = fs.readFileSync(p, 'utf8');
  const marker = 'export const sourceCodeMap';
  const idx = raw.indexOf(marker);
  if (idx === -1) throw new Error('sourceCodeMap export not found');
  const assignIdx = raw.indexOf('=', idx);
  if (assignIdx === -1) throw new Error('Assignment for sourceCodeMap not found');
  const firstBrace = raw.indexOf('{', assignIdx);
  if (firstBrace === -1) throw new Error('Opening brace for sourceCodeMap object not found');

  // Brace-depth scan while being string-literal aware (" and ') and handling escapes.
  let i = firstBrace;
  let depth = 0;
  let inString = false;
  let stringQuote = '';
  let escaped = false;
  let captured = '';
  while (i < raw.length) {
    const ch = raw[i];
    captured += ch;
    if (inString) {
      if (escaped) {
        escaped = false; // consume escape
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === stringQuote) {
        inString = false;
      }
    } else {
      if (ch === '"' || ch === '\'') {
        inString = true;
        stringQuote = ch;
      } else if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0) {
          break; // reached end of top-level object
        }
      }
    }
    i++;
  }
  if (depth !== 0) throw new Error('Failed to parse object literal for sourceCodeMap (unbalanced braces)');
  // captured now contains the full object literal text which is valid JSON (generator uses JSON.stringify)
  try {
    return JSON.parse(captured);
  } catch (e) {
    // Emit a small snippet for debugging
    console.error('Failed to JSON.parse captured sourceCodeMap. First 300 chars:', captured.slice(0, 300));
    throw e;
  }
}

function main() {
  const docsMap = loadDocsJson();
  const tsMap = loadSourceCodeMapTS();
  const allKeys = new Set([...Object.keys(docsMap), ...Object.keys(tsMap)]);
  const diffs = [];

  // Detect suspicious / probably typo keys (e.g., containing 'gxroup')
  const warnings = [];

  for (const k of allKeys) {
    const a = docsMap[k];
    const b = tsMap[k];
    if (a === undefined) {
      diffs.push({ key: k, issue: 'missing-in-docs-json' });
    } else if (b === undefined) {
      diffs.push({ key: k, issue: 'missing-in-sourceCodeMap' });
    } else if (a !== b) {
      // Provide small diff window
      const prefix = a.slice(0, 40).replace(/\n/g, '⏎');
      const prefixB = b.slice(0, 40).replace(/\n/g, '⏎');
      diffs.push({ key: k, issue: 'content-mismatch', docsHead: prefix, mapHead: prefixB });
    }
    if (/gxr?oup/i.test(k)) {
      warnings.push(`Suspicious key spelling: ${k}`);
    }
  }

  if (diffs.length === 0) {
    console.log('✅ Code integrity: All demo code strings match between docs.json and sourceCodeMap.ts');
  } else {
    console.log(`❌ Code integrity issues (${diffs.length}):`);
    diffs.forEach(d => console.log(` - ${d.key}: ${d.issue}${d.docsHead ? ` (docs:"${d.docsHead}" map:"${d.mapHead}")` : ''}`));
    process.exitCode = 1;
  }

  if (warnings.length) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(w => console.log(' - ' + w));
  }
}

if (require.main === module) {
  try { main(); } catch (e) { console.error('Integrity check failed:', e); process.exit(1); }
}
