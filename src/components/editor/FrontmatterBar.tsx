import { Pin, PinOff, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { NOTE_LANGUAGES } from '@/lib/constants'
import { getWorkspaceDisplayName } from '@/lib/workspaceLabel'
import type { Note, PreviewMode, Workspace } from '@/types'

interface FrontmatterBarProps {
  note: Note
  workspaces: Workspace[]
  allTags: string[]
  previewMode: PreviewMode
  onChange: (patch: Partial<Note>) => void
  onDelete: () => Promise<void>
  onTogglePin: () => Promise<void>
  onPreviewModeChange: (mode: PreviewMode) => void
  onOpenFindReplace: () => void
  onOpenHistory: () => void
}

function controlClassName() {
  return 'rounded-lg border border-border bg-base px-2.5 py-1.5 text-xs text-text-primary outline-none transition focus:border-focus'
}

function inlineFieldClassName() {
  return 'inline-flex items-center gap-2 rounded-lg border border-border bg-base px-2.5 py-1.5'
}

export function FrontmatterBar({
  note,
  workspaces,
  allTags,
  previewMode,
  onChange,
  onDelete,
  onTogglePin,
  onPreviewModeChange,
  onOpenFindReplace,
  onOpenHistory,
}: FrontmatterBarProps) {
  const { t } = useTranslation()
  const [tagValue, setTagValue] = useState('')

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-2 border-b border-border bg-surface px-4 py-2">
      <input
        className="min-w-[220px] flex-1 rounded-lg border border-border bg-base px-3 py-2 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-muted focus:border-focus"
        placeholder={t('note.titlePlaceholder')}
        title={t('note.titlePlaceholder')}
        value={note.title}
        onChange={(event) => onChange({ title: event.target.value })}
      />

      <label className={inlineFieldClassName()}>
        <span className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
          {t('note.workspaceLabel')}
        </span>
        <select
          className={controlClassName()}
          value={note.workspace}
          onChange={(event) => onChange({ workspace: event.target.value })}
          title={t('note.workspaceLabel')}
        >
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {getWorkspaceDisplayName(workspace, t)}
            </option>
          ))}
        </select>
      </label>

      <label className={inlineFieldClassName()}>
        <span className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
          {t('note.languageLabel')}
        </span>
        <select
          className={controlClassName()}
          value={note.language}
          onChange={(event) => onChange({ language: event.target.value })}
          title={t('note.languageLabel')}
        >
          {NOTE_LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap items-center gap-2">
        {note.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-base px-2 py-1 text-[11px] text-text-secondary transition hover:border-focus hover:text-text-primary"
            onClick={() =>
              onChange({
                tags: note.tags.filter((item) => item !== tag),
              })
            }
          >
            {tag}
            <X className="h-3 w-3" />
          </button>
        ))}
      </div>

      <label className={inlineFieldClassName()}>
        <span className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
          {t('note.tagsLabel')}
        </span>
        <input
          className={`${controlClassName()} w-32`}
          list="note-tag-suggestions"
          placeholder={t('note.addTag')}
          title={t('note.addTagHelp')}
          value={tagValue}
          onChange={(event) => setTagValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') {
              return
            }

            event.preventDefault()
            const nextTag = tagValue.trim()
            if (!nextTag || note.tags.includes(nextTag)) {
              setTagValue('')
              return
            }

            onChange({
              tags: [...note.tags, nextTag],
            })
            setTagValue('')
          }}
        />
        <datalist id="note-tag-suggestions">
          {allTags.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
      </label>

      <button
        type="button"
        className="rounded-lg border border-border bg-base p-2 text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
        onClick={() => void onTogglePin()}
        title={note.pinned ? t('commands.unpinNote') : t('commands.pinNote')}
      >
        {note.pinned ? (
          <PinOff className="h-4 w-4" />
        ) : (
          <Pin className="h-4 w-4" />
        )}
      </button>

      <button
        type="button"
        className="rounded-lg border border-border bg-base p-2 text-text-secondary transition hover:border-red/40 hover:bg-red/10 hover:text-red"
        onClick={() => void onDelete()}
        title={t('commands.deleteNote')}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1 rounded-lg border border-border bg-base p-1">
        {(['editor', 'split', 'preview'] as PreviewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`rounded-md px-2 py-1 text-xs transition ${
              previewMode === mode
                ? 'bg-active text-text-primary'
                : 'text-text-secondary hover:bg-hover hover:text-text-primary'
            }`}
            onClick={() => onPreviewModeChange(mode)}
            title={t(`preview.${mode}`)}
          >
            {t(`preview.${mode}`)}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="rounded-lg border border-border bg-base px-2.5 py-1.5 text-xs text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
        onClick={onOpenFindReplace}
      >
        {t('commands.findReplace')}
      </button>

      <button
        type="button"
        className="rounded-lg border border-border bg-base px-2.5 py-1.5 text-xs text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
        onClick={onOpenHistory}
      >
        {t('history.title')}
      </button>
    </div>
  )
}
