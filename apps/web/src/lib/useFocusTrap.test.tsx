import React, { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useFocusTrap } from '@/lib/useFocusTrap';

function Harness({ onEscape }: { onEscape: () => void }): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onEscape);
  return (
    <div>
      <button type="button">outside</button>
      <div ref={ref} tabIndex={-1} role="dialog" aria-label="dialog">
        <button type="button">first</button>
        <button type="button">last</button>
      </div>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('focuses the container, wraps Tab at both ends and closes on Escape', () => {
    const onEscape = vi.fn();
    render(<Harness onEscape={onEscape} />);
    const dialog = screen.getByRole('dialog');
    expect(document.activeElement).toBe(dialog);

    const last = screen.getByText('last');
    const first = screen.getByText('first');
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('restores focus to the previously focused element on unmount', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const { unmount } = render(<Harness onEscape={() => undefined} />);
    expect(document.activeElement).not.toBe(trigger);
    unmount();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});
