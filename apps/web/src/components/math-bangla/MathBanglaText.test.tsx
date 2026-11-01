import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  MathBanglaText,
  parseMathBanglaSegments,
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
    const segments = parseMathBanglaSegments(input);

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

  it('renders Bangla text and KaTeX formulas with proper typography classes', () => {
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
    expect(container.querySelector('.katex')).not.toBeNull();
  });
});

