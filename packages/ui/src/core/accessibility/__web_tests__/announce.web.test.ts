import { announce, clearAnnouncer } from '../announce';

const regions = () => document.querySelector('[data-plocks-announcer]');
const region = (politeness: 'polite' | 'assertive') =>
  document.querySelector<HTMLElement>(`[data-plocks-announcer] [aria-live="${politeness}"]`);

describe('announce (web)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    clearAnnouncer();
    jest.useRealTimers();
  });

  it('creates one persistent, visually hidden live container lazily', () => {
    expect(regions()).toBeNull();
    announce('Saved');
    const container = regions();
    expect(container).not.toBeNull();
    expect(container?.getAttribute('style')).toContain('position:absolute');
    announce('Again', { politeness: 'assertive' });
    expect(document.querySelectorAll('[data-plocks-announcer]')).toHaveLength(1);
    expect(region('polite')?.getAttribute('role')).toBe('status');
    expect(region('assertive')?.getAttribute('role')).toBe('alert');
    expect(region('polite')?.getAttribute('aria-atomic')).toBe('true');
  });

  it('clears, then writes the message on a later task', () => {
    announce('3 results');
    expect(region('polite')?.textContent).toBe('');
    jest.advanceTimersByTime(60);
    expect(region('polite')?.textContent).toBe('3 results');
  });

  it('re-announces an identical message by clearing first', () => {
    announce('Copied');
    jest.advanceTimersByTime(60);
    expect(region('polite')?.textContent).toBe('Copied');
    announce('Copied');
    expect(region('polite')?.textContent).toBe('');
    jest.advanceTimersByTime(60);
    expect(region('polite')?.textContent).toBe('Copied');
  });

  it('routes assertive messages to the assertive region and clears stale text', () => {
    announce('Payment failed', { politeness: 'assertive' });
    jest.advanceTimersByTime(60);
    expect(region('assertive')?.textContent).toBe('Payment failed');
    expect(region('polite')?.textContent).toBe('');
    jest.advanceTimersByTime(7000);
    expect(region('assertive')?.textContent).toBe('');
  });

  it('recreates the region if the app removed it', () => {
    announce('One');
    regions()?.remove();
    announce('Two');
    jest.advanceTimersByTime(60);
    expect(region('polite')?.textContent).toBe('Two');
  });
});
