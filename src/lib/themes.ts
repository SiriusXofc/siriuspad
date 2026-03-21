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
      '--accent-subtle': 'rgba(124, 58, 237, 0.12)',
      '--scrollbar-thumb': '#2b2b2b',
      '--scrollbar-track': '#111111',
      '--selection': 'rgba(124, 58, 237, 0.28)',
      '--shadow-soft': 'rgba(0, 0, 0, 0.28)',
    },
  },
  {
    id: 'light',
    name: 'Light',
    vars: {
      '--bg-base': '#f4f6fb',
      '--bg-surface': '#ffffff',
      '--bg-elevated': '#eef2f8',
      '--bg-hover': '#e8edf5',
      '--bg-active': '#dfe6f2',
      '--border': '#d5dbe6',
      '--border-focus': '#aeb8c8',
      '--text-primary': '#1f2430',
      '--text-secondary': '#4f596b',
      '--text-muted': '#768095',
      '--accent': '#6d28d9',
      '--accent-hover': '#5b21b6',
      '--accent-subtle': 'rgba(109, 40, 217, 0.10)',
      '--scrollbar-thumb': '#c1c9d7',
      '--scrollbar-track': '#edf2f8',
      '--selection': 'rgba(109, 40, 217, 0.18)',
      '--shadow-soft': 'rgba(31, 36, 48, 0.08)',
      '--tag-bug-bg': '#feecec',
      '--tag-bug-color': '#b91c1c',
      '--tag-bug-border': '#f6c6c6',
      '--tag-urgent-bg': '#fff0cf',
      '--tag-urgent-color': '#92400e',
      '--tag-urgent-border': '#e5bf79',
      '--tag-feat-bg': '#f2ebff',
      '--tag-feat-color': '#6d28d9',
      '--tag-feat-border': '#dccbfd',
      '--tag-idea-bg': '#e1f8ed',
      '--tag-idea-color': '#065f46',
      '--tag-idea-border': '#9fd4b9',
      '--tag-note-bg': '#eaf2ff',
      '--tag-note-color': '#1e40af',
      '--tag-note-border': '#bdd3fb',
      '--tag-done-bg': '#f3f5f8',
      '--tag-done-color': '#64748b',
      '--tag-done-border': '#d8e0ea',
      '--priority-high': '#c2410c',
      '--priority-medium': '#a16207',
      '--priority-low': '#64748b',
      '--green': '#047857',
      '--red': '#b91c1c',
      '--yellow': '#a16207',
      '--blue': '#1d4ed8',
    },
  },
  {
    id: 'dark-dimmed',
    name: 'Dark Dimmed',
    vars: {
      '--bg-base': '#14171f',
      '--bg-surface': '#1a1f29',
      '--bg-elevated': '#202633',
      '--bg-hover': '#252c39',
      '--bg-active': '#2a3241',
      '--border': '#2c3544',
      '--border-focus': '#41506a',
      '--text-primary': '#dfe5ef',
      '--text-secondary': '#8b98ad',
      '--text-muted': '#617086',
      '--accent': '#7c3aed',
      '--accent-hover': '#6d2fd4',
      '--accent-subtle': 'rgba(124, 58, 237, 0.12)',
      '--scrollbar-thumb': '#374152',
      '--scrollbar-track': '#1a1f29',
      '--selection': 'rgba(124, 58, 237, 0.24)',
      '--shadow-soft': 'rgba(0, 0, 0, 0.24)',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    vars: {
      '--bg-base': '#090b10',
      '--bg-surface': '#0d1118',
      '--bg-elevated': '#111723',
      '--bg-hover': '#18202e',
      '--bg-active': '#1d2838',
      '--border': '#1f2937',
      '--border-focus': '#334155',
      '--text-primary': '#e5edf8',
      '--text-secondary': '#8b98ad',
      '--text-muted': '#5f6c80',
      '--accent': '#8b5cf6',
      '--accent-hover': '#7c3aed',
      '--accent-subtle': 'rgba(139, 92, 246, 0.12)',
      '--scrollbar-thumb': '#293548',
      '--scrollbar-track': '#0d1118',
      '--selection': 'rgba(139, 92, 246, 0.22)',
      '--shadow-soft': 'rgba(0, 0, 0, 0.32)',
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
  root.dataset.theme = theme.id
  root.style.setProperty('color-scheme', theme.id === 'light' ? 'light' : 'dark')
}
