import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        subtle: 'var(--bg-subtle)',
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
        },
        accent: {
          warm: 'var(--accent-warm)',
        },
        status: {
          success: 'var(--status-success)',
          warning: 'var(--status-warning)',
          danger: 'var(--status-danger)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        border: {
          subtle: 'var(--border-subtle)',
        },
      },
      fontFamily: {
        heading: [
          'var(--font-hind-siliguri)',
          'var(--font-plus-jakarta)',
          'sans-serif',
        ],
        bangla: [
          'var(--font-noto-sans-bengali)',
          'var(--font-hind-siliguri)',
          'sans-serif',
        ],
        sans: [
          'var(--font-plus-jakarta)',
          'var(--font-hind-siliguri)',
          'sans-serif',
        ],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      lineHeight: {
        'bangla-body': '1.80',
        'bangla-question': '1.75',
        'bangla-heading': '1.45',
      },
      maxWidth: {
        'lesson-measure': '68ch',
        'question-measure': '65ch',
      },
    },
  },
  plugins: [],
};

export default config;

