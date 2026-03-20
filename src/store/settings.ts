import { create } from 'zustand'

import i18n from '@/i18n'
import {
  DEFAULT_SETTINGS,
  UI_ZOOM_MAX,
  UI_ZOOM_MIN,
  UI_ZOOM_STEP,
} from '@/lib/constants'
import { getAppStore } from '@/lib/storage'
import { applyTheme } from '@/lib/themes'
import type { AppLanguage, Settings } from '@/types'

type SettingsSection =
  | 'editor'
  | 'appearance'
  | 'variables'
  | 'integrations'
  | 'shortcuts'
  | 'language'

interface SettingsState {
  settings: Settings
  ready: boolean
  initialize: () => Promise<void>
  update: (patch: Partial<Settings>) => Promise<void>
  setVariable: (key: string, value: string) => Promise<void>
  removeVariable: (key: string) => Promise<void>
  resetSection: (section: SettingsSection) => Promise<void>
}

async function persistSettings(settings: Settings) {
  const store = await getAppStore()
  await store.set('settings', settings)
  await store.save()
}

function normalizeUiZoom(value: number | null | undefined) {
  const numeric = Number(value)

  if (!Number.isFinite(numeric)) {
    return DEFAULT_SETTINGS.uiZoom
  }

  const rounded = Math.round(numeric / UI_ZOOM_STEP) * UI_ZOOM_STEP
  return Math.min(UI_ZOOM_MAX, Math.max(UI_ZOOM_MIN, Number(rounded.toFixed(2))))
}

function applyInterfaceSettings(settings: Settings) {
  if (typeof document === 'undefined') {
    return
  }

  const fontStack = `"${settings.fontFamily}", "JetBrains Mono", "Fira Code", "Cascadia Code", monospace`
  const root = document.documentElement

  root.style.setProperty('--font-ui', fontStack)
  root.style.setProperty('--font-mono', fontStack)
}

function normalizeLanguage(language: string | null | undefined): AppLanguage {
  const normalized = (language ?? '').trim().toLowerCase()

  if (normalized.startsWith('pt')) {
    return 'pt-BR'
  }

  if (normalized.startsWith('es')) {
    return 'es'
  }

  return 'en'
}

function detectSystemLanguage(): AppLanguage {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return normalizeLanguage(navigator.language)
  }

  return DEFAULT_SETTINGS.language
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  ready: false,
  async initialize() {
    if (get().ready) {
      return
    }

    const store = await getAppStore()
    const persisted = await store.get<Settings>('settings')
    const language = persisted?.language
      ? normalizeLanguage(persisted.language)
      : detectSystemLanguage()
    const settings = {
      ...DEFAULT_SETTINGS,
      ...persisted,
      language,
      uiZoom: normalizeUiZoom(persisted?.uiZoom),
      variables: {
        ...DEFAULT_SETTINGS.variables,
        ...(persisted?.variables ?? {}),
      },
    }

    set({ settings, ready: true })
    applyTheme(settings.theme)
    applyInterfaceSettings(settings)
    await i18n.changeLanguage(settings.language)
    await persistSettings(settings)
  },
  async update(patch) {
    const nextLanguage = patch.language
      ? normalizeLanguage(patch.language)
      : get().settings.language
    const settings = {
      ...get().settings,
      ...patch,
      language: nextLanguage,
      uiZoom:
        patch.uiZoom === undefined
          ? get().settings.uiZoom
          : normalizeUiZoom(patch.uiZoom),
      variables: patch.variables
        ? { ...patch.variables }
        : { ...get().settings.variables },
    }

    set({ settings })
    applyTheme(settings.theme)
    applyInterfaceSettings(settings)

    if (patch.language) {
      await i18n.changeLanguage(nextLanguage)
    }

    await persistSettings(settings)
  },
  async setVariable(key, value) {
    const cleanKey = key.trim().toUpperCase()

    if (!cleanKey) {
      return
    }

    const settings = {
      ...get().settings,
      variables: {
        ...get().settings.variables,
        [cleanKey]: value,
      },
    }

    set({ settings })
    await persistSettings(settings)
  },
  async removeVariable(key) {
    const nextVariables = { ...get().settings.variables }
    delete nextVariables[key]

    const settings = {
      ...get().settings,
      variables: nextVariables,
    }

    set({ settings })
    await persistSettings(settings)
  },
  async resetSection(section) {
    const current = get().settings
    let next: Settings

    switch (section) {
      case 'editor':
        next = {
          ...current,
          fontSize: DEFAULT_SETTINGS.fontSize,
          tabSize: DEFAULT_SETTINGS.tabSize,
          wordWrap: DEFAULT_SETTINGS.wordWrap,
          autosave: DEFAULT_SETTINGS.autosave,
          autosaveDelay: DEFAULT_SETTINGS.autosaveDelay,
          showLineNumbers: DEFAULT_SETTINGS.showLineNumbers,
        }
        break
      case 'appearance':
        next = {
          ...current,
          uiZoom: DEFAULT_SETTINGS.uiZoom,
          theme: DEFAULT_SETTINGS.theme,
          fontFamily: DEFAULT_SETTINGS.fontFamily,
        }
        break
      case 'language':
        next = {
          ...current,
          language: detectSystemLanguage(),
        }
        break
      case 'variables':
        next = {
          ...current,
          variables: {},
        }
        break
      case 'integrations':
        next = {
          ...current,
          githubToken: DEFAULT_SETTINGS.githubToken,
        }
        break
      case 'shortcuts':
      default:
        next = {
          ...current,
          defaultWorkspace: DEFAULT_SETTINGS.defaultWorkspace,
        }
        break
    }

    set({ settings: next })
    applyTheme(next.theme)
    applyInterfaceSettings(next)

    if (section === 'language') {
      await i18n.changeLanguage(next.language)
    }

    await persistSettings(next)
  },
}))
