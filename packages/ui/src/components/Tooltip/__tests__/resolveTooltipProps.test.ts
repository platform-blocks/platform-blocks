import { resolveTooltipProps, getTooltipText } from '../resolveTooltipProps';

describe('resolveTooltipProps', () => {
  it('expands the string shorthand into a label', () => {
    expect(resolveTooltipProps('Copy value')).toEqual({ label: 'Copy value' });
  });

  it('returns null for nothing to show', () => {
    expect(resolveTooltipProps(undefined)).toBeNull();
    expect(resolveTooltipProps(null)).toBeNull();
    expect(resolveTooltipProps(false)).toBeNull();
    expect(resolveTooltipProps('')).toBeNull();
    expect(resolveTooltipProps({ label: '' })).toBeNull();
  });

  it('applies host defaults under the string form', () => {
    expect(resolveTooltipProps('Copy', { position: 'right' })).toEqual({
      label: 'Copy',
      position: 'right',
    });
  });

  it('lets the object form override host defaults', () => {
    expect(
      resolveTooltipProps({ label: 'Copy', position: 'bottom', maxWidth: 320 }, { position: 'top' })
    ).toEqual({ label: 'Copy', position: 'bottom', maxWidth: 320 });
  });
});

describe('getTooltipText', () => {
  it('reads the plain-text label from either form', () => {
    expect(getTooltipText('Copy')).toBe('Copy');
    expect(getTooltipText({ label: 'Copy', maxWidth: 200 })).toBe('Copy');
  });

  it('is undefined when there is no string label', () => {
    expect(getTooltipText(undefined)).toBeUndefined();
    expect(getTooltipText(false)).toBeUndefined();
  });
});
