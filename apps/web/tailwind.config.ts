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
        // Blackboard Slate Ground Tokens
        slate: {
          DEFAULT: '#0D1814',
          2: '#13221C',
          3: '#1A2D26',
        },
        chalk: {
          DEFAULT: '#EDE8DA',
          2: '#B5B9AA',
          3: '#7E8A80',
        },
        marigold: {
          DEFAULT: '#FFB238',
          ink: '#241600',
        },
        redpen: '#FF6152',
        tick: '#7FD6A0',
        paper: {
          DEFAULT: '#F3EBD5',
          rule: '#B9CDE0',
        },
        ink: '#22408F',

        // Semantic bindings mapped to CSS variables
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        subtle: 'var(--bg-subtle)',
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          coral: 'var(--brand-coral)',
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
        display: [
          'var(--f-display)',
          'Anek Bangla',
          'Hind Siliguri',
          'Noto Sans Bengali',
          'sans-serif',
        ],
        body: [
          'var(--f-body)',
          'Hind Siliguri',
          'Noto Sans Bengali',
          'sans-serif',
        ],
        hand: ['var(--f-hand)', 'Atma', 'Hind Siliguri', 'cursive'],
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
