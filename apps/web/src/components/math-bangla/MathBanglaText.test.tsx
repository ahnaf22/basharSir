import React from 'react';
import katex from 'katex';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  MathBanglaText,
  parseMathBanglaSegments,
  tokenizeMathBangla,
} from '@/components/math-bangla/MathBanglaText';
import {
  toAsciiNumerals,
  toBanglaNumerals,
} from '@/components/math-bangla/bangla-numerals';

describe('Bangla Numerals Formatter', () => {
  it('converts ASCII digits to Bengali numerals deterministically', () => {
    expect(toBanglaNumerals(2026)).toBe('২০২৬');
    expect(toBanglaNumerals('অধ্যায় 4: পৃষ্ঠা 49')).toBe('অধ্যায় ৪: পৃষ্ঠা ৪৯');
  });

  it('normalizes Bengali numerals back to ASCII digits', () => {
    expect(toAsciiNumerals('০১৭১২৩৪৫৬৭৮')).toBe('01712345678');
  });
});

describe('MathBanglaText & KaTeX Parser', () => {
  it('tokenizes mixed Bangla prose, inline LaTeX ($...$), and block LaTeX ($$...$$)', () => {
    const input =
      'যদি $x = 5$ হয়, তবে নিচের রাশিটির মান নির্ণয় করো: $$(a + b)^2 = a^2 + 2ab + b^2$$ ধন্যবাদ।';
    const segments = parseMathBanglaSegments(input, katex);

    expect(segments).toHaveLength(5);
    expect(segments[0]).toEqual({ type: 'text', value: 'যদি ' });
    expect(segments[1]?.type).toBe('math-inline');
    if (segments[1]?.type === 'math-inline') {
      expect(segments[1].latex).toBe('x = 5');
      expect(segments[1].html).toContain('katex');
    }
    expect(segments[3]?.type).toBe('math-block');
    if (segments[3]?.type === 'math-block') {
      expect(segments[3].latex).toBe('(a + b)^2 = a^2 + 2ab + b^2');
    }
  });


  it('tokenizes without KaTeX so plain text never needs the maths library', () => {
    expect(tokenizeMathBangla('শুধু বাংলা লেখা')).toEqual([
      { type: 'text', value: 'শুধু বাংলা লেখা' },
    ]);
    expect(tokenizeMathBangla('মান $x$')[1]).toEqual({ type: 'math-inline', latex: 'x' });
  });

  it('renders Bangla text and KaTeX formulas with proper typography classes', async () => {
    render(
      <MathBanglaText
        content="বীজগণিতের সূত্র: $(2x + 3y)^2 = 4x^2 + 12xy + 9y^2$"
        variant="lesson-body"
      />
    );

    const container = screen.getByTestId('math-bangla-text');
    expect(container).toHaveAttribute('lang', 'bn');
    expect(container.textContent).toContain('বীজগণিতের সূত্র:');
    const mathNode = container.querySelector('[data-latex]');
    expect(mathNode).not.toBeNull();
    expect(mathNode?.getAttribute('data-latex')).toBe(
      '(2x + 3y)^2 = 4x^2 + 12xy + 9y^2'
    );
    await waitFor(() => expect(container.querySelector('.katex')).not.toBeNull());
  });
});
