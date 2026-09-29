import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { DEFAULT_FONT_FAMILY_MONO, DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import { H2, Mark } from '../aliases';
import { Text } from '../Text';

/** jsdom normalises colours; compare through a probe element. */
const cssColor = (color: string) => {
  const probe = document.createElement('span');
  probe.style.backgroundColor = color;
  return probe.style.backgroundColor;
};

describe('Text (web)', () => {
  it('renders heading variants as heading elements with their level', () => {
    render(
      <>
        <Text variant="h1">Page title</Text>
        <H2>Section</H2>
        <Text variant="p" as="h3">Styled as body, semantically h3</Text>
      </>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Page title' }).tagName).toBe('H1');
    expect(screen.getByRole('heading', { level: 2, name: 'Section' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('Styled as body, semantically h3');
  });

  it('renders body text as a paragraph without a role', () => {
    render(<Text>Body copy</Text>);
    const el = screen.getByText('Body copy');
    expect(el.tagName).toBe('P');
    expect(el.getAttribute('role')).toBeNull();
    expect(el.getAttribute('tabindex')).toBeNull();
  });

  it('falls back to a div when a paragraph would contain block content', () => {
    render(
      <Text testID="outer">
        Outer <Text variant="h4">Nested heading</Text>
      </Text>
    );
    expect(screen.getByTestId('outer').tagName).toBe('DIV');
  });

  it('exposes pressable text as a focusable button activated by Enter and Space', () => {
    const onPress = jest.fn();
    render(<Text onPress={onPress}>Retry</Text>);

    const button = screen.getByRole('button', { name: 'Retry' });
    expect(button.getAttribute('tabindex')).toBe('0');

    fireEvent.click(button);
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.keyDown(button, { key: ' ' });
    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it('uses the consumer role for pressable text (link: Enter only)', () => {
    const onPress = jest.fn();
    render(
      <Text role="link" onPress={onPress}>
        Docs
      </Text>
    );

    const link = screen.getByRole('link', { name: 'Docs' });
    fireEvent.keyDown(link, { key: ' ' });
    expect(onPress).not.toHaveBeenCalled();
    fireEvent.keyDown(link, { key: 'Enter' });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('marks disabled pressable text and does not activate it', () => {
    const onPress = jest.fn();
    render(
      <Text onPress={onPress} disabled>
        Disabled action
      </Text>
    );

    const button = screen.getByRole('button', { name: 'Disabled action' });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('tabindex')).toBeNull();
    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('forwards role, aria-*, accessibilityLabel, nativeID and testID to the element', () => {
    render(
      <Text
        role="status"
        aria-live="polite"
        aria-describedby="hint"
        accessibilityLabel="Three unread messages"
        nativeID="unread"
        testID="unread-count"
        dataSet={{ trackingId: 'x1' }}
        lang="en"
      >
        3
      </Text>
    );

    const el = screen.getByTestId('unread-count');
    expect(el).toBe(screen.getByRole('status', { name: 'Three unread messages' }));
    expect(el.getAttribute('aria-live')).toBe('polite');
    expect(el.getAttribute('aria-describedby')).toBe('hint');
    expect(el.id).toBe('unread');
    expect(el.getAttribute('data-tracking-id')).toBe('x1');
    expect(el.getAttribute('lang')).toBe('en');
  });

  it('lets an explicit aria-label win over accessibilityLabel', () => {
    render(
      <Text accessibilityLabel="legacy" aria-label="canonical">
        x
      </Text>
    );
    expect(screen.getByLabelText('canonical')).toBeTruthy();
  });

  it('paints mark with the theme mark background and code with the mono font', () => {
    render(
      <>
        <Mark>highlighted</Mark>
        <Text variant="code">npm i</Text>
      </>
    );

    const mark = screen.getByText('highlighted');
    expect(mark.tagName).toBe('MARK');
    expect(mark.style.backgroundColor).toBe(cssColor(DEFAULT_THEME.backgrounds.mark));

    const code = screen.getByText('npm i');
    expect(code.tagName).toBe('CODE');
    expect(code.style.fontFamily).toBe(
      (() => {
        const probe = document.createElement('span');
        probe.style.fontFamily = DEFAULT_FONT_FAMILY_MONO;
        return probe.style.fontFamily;
      })()
    );
  });

  it('renders the caption variant as a span (caption is a table element)', () => {
    render(<Text variant="caption">Figure 1</Text>);
    expect(screen.getByText('Figure 1').tagName).toBe('SPAN');
  });

  it('renders without an I18n provider and resolves tx to the key', () => {
    render(<Text tx="greeting.hello">fallback</Text>);
    expect(screen.getByText(/greeting\.hello|fallback/)).toBeTruthy();
  });

  it('forwards its ref to the DOM element', () => {
    const ref = React.createRef<unknown>();
    render(<Text ref={ref as React.Ref<never>}>Ref target</Text>);
    expect(ref.current).toBe(screen.getByText('Ref target'));
  });
});
