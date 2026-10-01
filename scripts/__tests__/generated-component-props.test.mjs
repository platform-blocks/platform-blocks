// Run after npm run demos:generate with node --test scripts/__tests__/generated-component-props.test.mjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const generated = new URL('../../apps/docs/data/generated/', import.meta.url);
const read = name => fs.readFileSync(new URL(name, generated), 'utf8');
const props = JSON.parse(read('components-props.json'));
const meta = JSON.parse(read('components-meta.json'));
const prop = (component, name) => {
  const result = props[component]?.find(entry => entry.name === name);
  assert.ok(result, `${component}.${name} must be documented`);
  return result;
};

test('every catalog page has public props and matching metadata', () => {
  for (const [name, entry] of Object.entries(meta)) {
    assert.equal(entry.name, name);
    assert.ok(props[name]?.some(entry => !entry.internal), name);
    assert.equal(new Set(props[name].map(entry => entry.name)).size, props[name].length, name);
  }
});

test('selection unions retain shared props and both value/callback types', () => {
  for (const name of ['ComboboxPopover', 'TreeSelect']) {
    assert.equal(prop(name, 'data').required, true);
    assert.equal(prop(name, 'searchable').type, 'boolean');
    assert.equal(prop(name, 'value').type, 'string | null | string[]');
    assert.equal(prop(name, 'defaultValue').type, 'string | null | string[]');
    const callback = prop(name, 'onChange').type;
    assert.match(callback, /^\(\(value: string \| null/);
    assert.match(callback, /\| \(\(value: string\[\]/);
    assert.equal(prop(name, 'p').required, false);
  }
  assert.equal(prop('ComboboxPopover', 'children').required, true);
  assert.equal(prop('ComboboxPopover', 'multiple').required, false);
  assert.equal(prop('ComboboxPopover', 'aria-label').type, 'string');
  assert.equal(prop('ComboboxPopover', 'allowDeselect').required, false);
  assert.equal(prop('TreeSelect', 'mode').type, "'single' | 'multiple' | 'checkbox'");
  assert.equal(prop('TreeSelect', 'mode').required, false);
  assert.equal(prop('TreeSelect', 'checkStrictly').type, 'boolean');
  assert.equal(prop('TreeSelect', 'maxValues').type, 'number');
});

test('MiniCalendar resolves its interface from Calendar and implementation defaults', () => {
  assert.equal(prop('MiniCalendar', 'value').type, 'Date | null');
  assert.equal(prop('MiniCalendar', 'numberOfDays').defaultValue, '7');
  assert.equal(prop('MiniCalendar', 'locale').defaultValue, "'en-US'");
  assert.equal(prop('MiniCalendar', 'p').required, false);
  prop('MiniCalendar', 'renderDay');
  prop('MiniCalendar', 'nextControlProps');
});

test('Layout documents Row and Column including inherited Flex props and valid imports', () => {
  assert.equal(meta.Layout.title, 'Layout');
  assert.equal(prop('Layout', 'direction').type, "'row' | 'row-reverse' | 'column' | 'column-reverse'");
  for (const name of ['align', 'justify', 'gap', 'children', 'fullWidth', 'p']) prop('Layout', name);
  const markdown = read('component-markdown/Layout.md');
  assert.match(markdown, /import \{ Row, Column \} from '@plocks\/ui'/);
  assert.doesNotMatch(markdown, /import \{ Layout \}/);
});

test('member splitting preserves trailing comments', () => {
  assert.match(prop('Card', 'children').description, /children optional/);
});
