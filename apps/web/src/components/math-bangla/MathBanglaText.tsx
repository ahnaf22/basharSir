import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type KatexRenderer = Pick<typeof import('katex').default, 'renderToString'>;

export type MathBanglaToken =
  | { type: 'text'; value: string }
  | { type: 'math-inline'; latex: string }
  | { type: 'math-block'; latex: string };

export type MathBanglaSegment =
  | { type: 'text'; value: string }
  | { type: 'math-inline'; latex: string; html: string }
  | { type: 'math-block'; latex: string; html: string };

// KaTeX (JS + CSS) is only fetched when a string actually contains a formula, so
// routes and lessons without maths never pay for it.
let katexPromise: Promise<KatexRenderer> | null = null;
let katexReady: KatexRenderer | null = null;

export function loadKatex(): Promise<KatexRenderer> {
  katexPromise ??= Promise.all([import('katex'), import('katex/dist/katex.min.css')]).then(
    ([mod]) => {
      katexReady = mod.default;
      return mod.default;
    },
  );
  return katexPromise;
}

/**
 * Splits mixed Bangla/English prose and LaTeX ($...$ and $$...$$) into tokens,
 * normalizing Unicode to NFC for proper Bengali conjunct (যুক্তবর্ণ) rendering.
 */
export function tokenizeMathBangla(rawContent: string): MathBanglaToken[] {
  const normalized = rawContent.normalize('NFC');
  if (!normalized) {
    return [];
  }

  // Matches $$...$$ (display) or $...$ (inline)
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  const tokens: MathBanglaToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = mathRegex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: normalized.slice(lastIndex, match.index) });
    }
    const token = match[0];
    const isBlock = token.startsWith('$$') && token.endsWith('$$');
    const latex = isBlock ? token.slice(2, -2).trim() : token.slice(1, -1).trim();
    tokens.push({ type: isBlock ? 'math-block' : 'math-inline', latex });
    lastIndex = match.index + token.length;
  }

  if (lastIndex < normalized.length) {
    tokens.push({ type: 'text', value: normalized.slice(lastIndex) });
  }
  return tokens;
}

/** Renders every formula token to KaTeX HTML with the given renderer. */
export function parseMathBanglaSegments(
  rawContent: string,
  katex: KatexRenderer,
): MathBanglaSegment[] {
  return tokenizeMathBangla(rawContent).map((token): MathBanglaSegment => {
    if (token.type === 'text') return token;
    const html = katex.renderToString(token.latex, {
      displayMode: token.type === 'math-block',
      throwOnError: false,
      strict: 'ignore',
      output: 'htmlAndMathml',
    });
    return { ...token, html };
  });
}

export interface MathBanglaTextProps {
  content: string;
  as?: 'div' | 'p' | 'span';
  variant?: 'lesson-body' | 'question' | 'compact';
  className?: string;
}

export function MathBanglaText({
  content,
  as: Component = 'div',
  variant = 'lesson-body',
  className,
}: MathBanglaTextProps): React.ReactElement {
  const tokens = useMemo(() => tokenizeMathBangla(content), [content]);
  const hasMath = tokens.some((token) => token.type !== 'text');
  const [katex, setKatex] = useState<KatexRenderer | null>(katexReady);

  useEffect(() => {
    if (!hasMath || katex) return undefined;
    let alive = true;
    void loadKatex().then((loaded) => {
      if (alive) setKatex(() => loaded);
    });
    return () => {
      alive = false;
    };
  }, [hasMath, katex]);

  // Until KaTeX arrives the formula shows as its plain LaTeX source, so the
  // text is readable straight away and the layout settles when it renders.
  const segments = useMemo<Array<MathBanglaSegment | MathBanglaToken>>(
    () => (katex ? parseMathBanglaSegments(content, katex) : tokens),
    [katex, content, tokens],
  );

  const variantClasses: Record<NonNullable<MathBanglaTextProps['variant']>, string> = {
    'lesson-body':
      'math-bangla-prose text-[16.5px] md:text-[18px] leading-bangla-body max-w-lesson-measure text-content-primary',
    question:
      'math-bangla-prose text-[17px] md:text-[19px] font-medium leading-bangla-question max-w-question-measure text-content-primary',
    compact: 'math-bangla-prose text-sm md:text-base leading-normal text-content-primary',
  };

  return (
    <Component
      lang="bn"
      className={cn(variantClasses[variant], className)}
      data-testid="math-bangla-text"
    >
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <React.Fragment key={index}>{segment.value}</React.Fragment>;
        }

        if (segment.type === 'math-block') {
          return (
            <span
              key={index}
              className="my-3 block overflow-x-auto rounded-lg border border-border-subtle bg-subtle px-4 py-3 text-center"
              data-latex={segment.latex}
              {...mathContent(segment)}
            />
          );
        }

        return (
          <span
            key={index}
            className="mx-0.5 inline-block align-baseline"
            data-latex={segment.latex}
            {...mathContent(segment)}
          />
        );
      })}
    </Component>
  );
}


function mathContent(
  segment: MathBanglaSegment | MathBanglaToken,
): { dangerouslySetInnerHTML: { __html: string } } | { children: string } {
  if (segment.type !== 'text' && 'html' in segment) {
    return { dangerouslySetInnerHTML: { __html: segment.html } };
  }
  return { children: segment.type === 'text' ? segment.value : segment.latex };
}
