import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FONT_OPTIONS, LANGUAGE_OPTIONS } from '@/lib/constants'
import { THEMES } from '@/lib/themes'
import { Modal } from '@/components/ui/Modal'
import type { AppLanguage, Settings, Workspace } from '@/types'

interface SettingsModalProps {
  open: boolean
  settings: Settings
  workspaces: Workspace[]
  onClose: () => void
  onUpdate: (patch: Partial<Settings>) => Promise<void>
  onSetVariable: (key: string, value: string) => Promise<void>
  onRemoveVariable: (key: string) => Promise<void>
  onResetSection: (
    section:
      | 'editor'
      | 'appearance'
      | 'variables'
      | 'integrations'
      | 'shortcuts'
      | 'language',
  ) => Promise<void>
}

function Section({
  title,
  description,
  onReset,
  resetLabel,
  children,
}: React.PropsWithChildren<{
  title: string
  description: string
  resetLabel: string
  onReset: () => Promise<void>
}>) {
  return (
    <section className="border-b border-border px-6 py-5 last:border-b-0">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <p className="mt-1 text-xs text-text-secondary">{description}</p>
        </div>
        <button
          type="button"
          className="rounded-md border border-border px-2.5 py-1 text-[11px] uppercase tracking-wide text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
          onClick={() => void onReset()}
        >
          {resetLabel}
        </button>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  )
}

function Field({
  label,
  description,
  children,
}: React.PropsWithChildren<{
  label: string
  description?: string
}>) {
  return (
    <label className="grid gap-2">
      <div>
        <span className="text-sm font-medium text-text-primary">{label}</span>
        {description ? (
          <p className="mt-1 text-xs text-text-secondary">{description}</p>
        ) : null}
      </div>
      {children}
    </label>
  )
}

function controlClassName() {
  return 'w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-focus'
}

export function SettingsModal({
  open,
  settings,
  workspaces,
  onClose,
  onUpdate,
  onSetVariable,
  onRemoveVariable,
  onResetSection,
}: SettingsModalProps) {
  const { t } = useTranslation()
  const [variableKey, setVariableKey] = useState('')
  const [variableValue, setVariableValue] = useState('')

  const shortcuts = [
    { key: 'Ctrl+N', action: t('commands.newNote') },
    { key: 'Ctrl+K', action: t('commands.commandPalette') },
    { key: 'Ctrl+F', action: t('titlebar.search') },
    { key: 'Ctrl+S', action: t('common.save') },
    { key: 'Ctrl+Enter', action: t('runner.run') },
    { key: 'Ctrl+W', action: t('commands.closeNote') },
    { key: 'Ctrl+,', action: t('settings.title') },
    { key: 'Ctrl+Shift+C', action: t('commands.copyNote') },
    { key: 'Ctrl+Shift+G', action: t('commands.exportGist') },
    { key: 'Ctrl+D', action: t('commands.duplicateNote') },
    { key: 'Ctrl+Shift+P', action: t('commands.pinNote') },
    { key: 'Ctrl+Shift+Z', action: t('commands.zenMode') },
    { key: 'Ctrl+Shift+F', action: t('commands.focusMode') },
    { key: 'Ctrl+Shift+M', action: t('commands.markdownPreview') },
    { key: 'Ctrl+H', action: t('commands.findReplace') },
    { key: 'F11', action: t('commands.toggleFullscreen') },
    { key: 'Alt+1..9', action: t('commands.switchWorkspace') },
  ]

  return (
    <Modal open={open} onClose={onClose} title={t('settings.title')} widthClassName="max-w-5xl">
      <Section
        title={t('settings.sections.editor.title')}
        description={t('settings.sections.editor.description')}
        onReset={() => onResetSection('editor')}
        resetLabel={t('settings.reset')}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('settings.fields.fontSize')}>
            <input
              className={controlClassName()}
              type="number"
              min={12}
              max={20}
              value={settings.fontSize}
              onChange={(event) =>
                void onUpdate({ fontSize: Number(event.target.value) })
              }
            />
          </Field>
          <Field label={t('settings.fields.tabSize')}>
            <select
              className={controlClassName()}
              value={settings.tabSize}
              onChange={(event) =>
                void onUpdate({ tabSize: Number(event.target.value) as 2 | 4 })
              }
            >
              <option value={2}>{t('settings.fields.tabSize2')}</option>
              <option value={4}>{t('settings.fields.tabSize4')}</option>
            </select>
          </Field>
          <Field label={t('settings.fields.wordWrap')}>
            <button
              type="button"
              className={`${controlClassName()} text-left`}
              onClick={() => void onUpdate({ wordWrap: !settings.wordWrap })}
            >
              {settings.wordWrap
                ? t('settings.fields.enabled')
                : t('settings.fields.disabled')}
            </button>
          </Field>
          <Field label={t('settings.fields.lineNumbers')}>
            <button
              type="button"
              className={`${controlClassName()} text-left`}
              onClick={() =>
                void onUpdate({ showLineNumbers: !settings.showLineNumbers })
              }
            >
              {settings.showLineNumbers
                ? t('settings.fields.visible')
                : t('settings.fields.hidden')}
            </button>
          </Field>
          <Field label={t('settings.fields.autosave')}>
            <button
              type="button"
              className={`${controlClassName()} text-left`}
              onClick={() => void onUpdate({ autosave: !settings.autosave })}
            >
              {settings.autosave
                ? t('settings.fields.enabled')
                : t('settings.fields.disabled')}
            </button>
          </Field>
          <Field label={t('settings.fields.autosaveDelay')}>
            <input
              className={controlClassName()}
              type="number"
              min={250}
              max={5000}
              step={50}
              value={settings.autosaveDelay}
              onChange={(event) =>
                void onUpdate({ autosaveDelay: Number(event.target.value) })
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title={t('settings.sections.appearance.title')}
        description={t('settings.sections.appearance.description')}
        onReset={() => onResetSection('appearance')}
        resetLabel={t('settings.reset')}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('settings.fields.theme')}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    settings.theme === theme.id
                      ? 'border-accent bg-accent/10 text-text-primary'
                      : 'border-border bg-surface text-text-secondary hover:border-focus hover:bg-hover'
                  }`}
                  onClick={() => void onUpdate({ theme: theme.id })}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t('settings.fields.fontFamily')}>
            <select
              className={controlClassName()}
              value={settings.fontFamily}
              onChange={(event) =>
                void onUpdate({ fontFamily: event.target.value })
              }
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section
        title={t('settings.sections.language.title')}
        description={t('settings.sections.language.description')}
        onReset={() => onResetSection('language')}
        resetLabel={t('settings.reset')}
      >
        <Field label={t('settings.fields.language')}>
          <select
            className={controlClassName()}
            value={settings.language}
            onChange={(event) =>
              void onUpdate({ language: event.target.value as AppLanguage })
            }
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      <Section
        title={t('settings.sections.shortcuts.title')}
        description={t('settings.sections.shortcuts.description')}
        onReset={() => onResetSection('shortcuts')}
        resetLabel={t('settings.reset')}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {shortcuts.map((item) => (
            <div
              key={item.key}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-secondary"
            >
              <span className="font-medium text-text-primary">{item.key}</span>
              <span className="mx-2 text-text-muted">-</span>
              <span>{item.action}</span>
            </div>
          ))}
        </div>
        <Field label={t('settings.fields.defaultWorkspace')}>
          <select
            className={controlClassName()}
            value={settings.defaultWorkspace}
            onChange={(event) =>
              void onUpdate({ defaultWorkspace: event.target.value })
            }
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      <Section
        title={t('settings.sections.variables.title')}
        description={t('settings.sections.variables.description')}
        onReset={() => onResetSection('variables')}
        resetLabel={t('settings.reset')}
      >
        <div className="grid gap-3">
          {Object.entries(settings.variables).length ? (
            Object.entries(settings.variables).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm text-text-primary">{key}</p>
                  <p className="truncate text-xs text-text-secondary">{value}</p>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-border px-2 py-1 text-xs text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
                  onClick={() => void onRemoveVariable(key)}
                >
                  {t('settings.variables.remove')}
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-text-secondary">
              {t('settings.variables.empty')}
            </div>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            className={controlClassName()}
            placeholder={t('settings.variables.keyPlaceholder')}
            value={variableKey}
            onChange={(event) => setVariableKey(event.target.value.toUpperCase())}
          />
          <input
            className={controlClassName()}
            placeholder={t('settings.variables.valuePlaceholder')}
            value={variableValue}
            onChange={(event) => setVariableValue(event.target.value)}
          />
          <button
            type="button"
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary transition hover:border-focus hover:bg-hover"
            onClick={() => {
              if (!variableKey.trim()) {
                return
              }

              void onSetVariable(variableKey.trim(), variableValue)
              setVariableKey('')
              setVariableValue('')
            }}
          >
            {t('settings.variables.add')}
          </button>
        </div>
      </Section>

      <Section
        title={t('settings.sections.integrations.title')}
        description={t('settings.sections.integrations.description')}
        onReset={() => onResetSection('integrations')}
        resetLabel={t('settings.reset')}
      >
        <Field
          label={t('settings.fields.githubToken')}
          description={t('settings.fields.githubTokenHint')}
        >
            <input
              className={controlClassName()}
              type="password"
              placeholder={t('settings.fields.githubTokenPlaceholder')}
              value={settings.githubToken}
              onChange={(event) =>
                void onUpdate({ githubToken: event.target.value })
              }
          />
        </Field>
      </Section>
    </Modal>
  )
}
