import React, { useMemo } from 'react';
import katex from 'katex';
import { cn } from '@/lib/utils';

export type MathBanglaSegment =
  | { type: 'text'; value: string }
  | { type: 'math-inline'; latex: string; html: string }
  | { type: 'math-block'; latex: string; html: string };

/**
 * Tokenizes mixed Bangla/English prose and LaTeX expressions ($...$ and $$...$$),
 * normalizing Unicode to NFC for proper Bengali conjunct (যুক্তবর্ণ) rendering.
 */
export function parseMathBanglaSegments(rawContent: string): MathBanglaSegment[] {
  const normalized = rawContent.normalize('NFC');
  if (!normalized) {
    return [];
  }

  // Matches $$...$$ (display) or $...$ (inline)
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  const segments: MathBanglaSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = mathRegex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        value: normalized.slice(lastIndex, match.index),
      });
    }

    const token = match[0];
    const isBlock = token.startsWith('$$') && token.endsWith('$$');
    const latex = isBlock ? token.slice(2, -2).trim() : token.slice(1, -1).trim();

    const html = katex.renderToString(latex, {
      displayMode: isBlock,
      throwOnError: false,
      strict: 'ignore',
      output: 'htmlAndMathml',
    });

    segments.push({
      type: isBlock ? 'math-block' : 'math-inline',
      latex,
      html,
    });

    lastIndex = match.index + token.length;
  }

  if (lastIndex < normalized.length) {
    segments.push({
      type: 'text',
      value: normalized.slice(lastIndex),
    });
  }

  return segments;
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
  const segments = useMemo(() => parseMathBanglaSegments(content), [content]);

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
              dangerouslySetInnerHTML={{ __html: segment.html }}
            />
          );
        }

        return (
          <span
            key={index}
            className="mx-0.5 inline-block align-baseline"
            data-latex={segment.latex}
            dangerouslySetInnerHTML={{ __html: segment.html }}
          />
        );
      })}
    </Component>
  );
}

