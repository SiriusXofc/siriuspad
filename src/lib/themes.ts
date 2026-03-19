import type { AppTheme, ThemeDefinition } from '@/types'

export const THEMES: ThemeDefinition[] = [
  {
    id: 'dark',
    name: 'Dark',
    vars: {
      '--bg-base': '#0d0d0d',
      '--bg-surface': '#111111',
      '--bg-elevated': '#161616',
      '--bg-hover': '#1a1a1a',
      '--bg-active': '#222222',
      '--border': '#1e1e1e',
      '--border-focus': '#2d2d2d',
      '--text-primary': '#e0e0e0',
      '--text-secondary': '#666666',
      '--text-muted': '#3a3a3a',
      '--accent': '#7c3aed',
      '--accent-hover': '#6d2fd4',
    },
  },
  {
    id: 'dark-dimmed',
    name: 'Dark Dimmed',
    vars: {
      '--bg-base': '#0d0d0d',
      '--bg-surface': '#111111',
      '--bg-elevated': '#161616',
      '--bg-hover': '#1a1a1a',
      '--bg-active': '#222222',
      '--border': '#1e1e1e',
      '--border-focus': '#2d2d2d',
      '--text-primary': '#e0e0e0',
      '--text-secondary': '#666666',
      '--text-muted': '#3a3a3a',
      '--accent': '#7c3aed',
      '--accent-hover': '#6d2fd4',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    vars: {
      '--bg-base': '#0d0d0d',
      '--bg-surface': '#111111',
      '--bg-elevated': '#161616',
      '--bg-hover': '#1a1a1a',
      '--bg-active': '#222222',
      '--border': '#1e1e1e',
      '--border-focus': '#2d2d2d',
      '--text-primary': '#e0e0e0',
      '--text-secondary': '#666666',
      '--text-muted': '#3a3a3a',
      '--accent': '#7c3aed',
      '--accent-hover': '#6d2fd4',
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
