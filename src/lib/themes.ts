import type { AppTheme, ThemeDefinition } from '@/types'

export const THEMES: ThemeDefinition[] = [
  {
    id: 'dark',
    name: 'Dark',
    vars: {
      '--bg-base': '#0d0d0d',
      '--bg-surface': '#141414',
      '--bg-elevated': '#1a1a1a',
      '--bg-hover': '#222222',
      '--bg-active': '#2a2a2a',
      '--border': '#2a2a2a',
      '--border-focus': '#3d3d3d',
      '--text-primary': '#e8e8e8',
      '--text-secondary': '#888888',
      '--text-muted': '#555555',
      '--accent': '#7c6af7',
      '--accent-hover': '#6b59e6',
    },
  },
  {
    id: 'dark-dimmed',
    name: 'Dark Dimmed',
    vars: {
      '--bg-base': '#161b22',
      '--bg-surface': '#1c2128',
      '--bg-elevated': '#22272e',
      '--bg-hover': '#2d333b',
      '--bg-active': '#373e47',
      '--border': '#373e47',
      '--border-focus': '#444c56',
      '--text-primary': '#cdd9e5',
      '--text-secondary': '#768390',
      '--text-muted': '#545d68',
      '--accent': '#539bf5',
      '--accent-hover': '#4184e4',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    vars: {
      '--bg-base': '#010409',
      '--bg-surface': '#0d1117',
      '--bg-elevated': '#161b22',
      '--bg-hover': '#1c2128',
      '--bg-active': '#22272e',
      '--border': '#21262d',
      '--border-focus': '#2d333b',
      '--text-primary': '#f0f6fc',
      '--text-secondary': '#8b949e',
      '--text-muted': '#484f58',
      '--accent': '#f78166',
      '--accent-hover': '#ff7b72',
    },
  },
]

export function applyTheme(themeId: AppTheme) {
  if (typeof document === 'undefined') {
    return
  }

  const theme = THEMES.find((item) => item.id === themeId) ?? THEMES[0]
  const root = document.documentElement

  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
