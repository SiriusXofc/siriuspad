import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        hover: 'var(--bg-hover)',
        active: 'var(--bg-active)',
        border: 'var(--border)',
        focus: 'var(--border-focus)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: 'var(--accent)',
        success: 'var(--green)',
        danger: 'var(--red)',
        warning: 'var(--yellow)',
        info: 'var(--blue)',
      },
      fontFamily: {
        ui: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
