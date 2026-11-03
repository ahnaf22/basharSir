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
          3: '#8E9A90',
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

        // Study-desk accent roles (values live in student-dashboard.css under .student-desk)
        desk: {
          accent: 'rgb(var(--desk-accent-rgb) / <alpha-value>)',
          'accent-hover': 'var(--desk-accent-hover)',
          'accent-ink': 'var(--desk-accent-ink)',
          'accent-soft': 'var(--desk-accent-soft)',
          'accent-soft-hover': 'var(--desk-accent-soft-hover)',
          'accent-line': 'var(--desk-accent-line)',
          ink: 'rgb(var(--desk-ink-rgb) / <alpha-value>)',
          'ink-hover': 'var(--desk-ink-hover)',
          paper: 'var(--desk-paper)',
          'paper-2': 'var(--desk-paper-2)',
          'paper-3': 'var(--desk-paper-3)',
          track: 'var(--desk-track)',
          'line-soft': 'var(--desk-line-soft)',
          line: 'var(--desk-line)',
          'line-strong': 'var(--desk-line-strong)',
          text: 'var(--desk-text)',
          'text-2': 'var(--desk-text-2)',
          muted: 'var(--desk-muted)',
        },

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
          'var(--font-hind-siliguri)',
          'var(--font-noto-sans-bengali)',
          'sans-serif',
        ],
        body: [
          'var(--f-body)',
          'var(--font-hind-siliguri)',
          'var(--font-noto-sans-bengali)',
          'sans-serif',
        ],
        hand: ['var(--f-hand)', 'cursive'],
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
