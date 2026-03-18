import { useTranslation } from 'react-i18next'

import { APP_VERSION } from '@/lib/constants'
import type { CursorInfo, Note, SaveStatus } from '@/types'

interface StatusBarProps {
  note: Note | null
  saveStatus: SaveStatus
  cursorInfo: CursorInfo | null
}

const statusColor: Record<SaveStatus, string> = {
  saved: 'bg-text-muted',
  dirty: 'bg-red',
  saving: 'bg-yellow',
  error: 'bg-red',
}

export function StatusBar({ note, saveStatus, cursorInfo }: StatusBarProps) {
  const { t } = useTranslation()

  return (
    <footer className="flex h-6 items-center justify-between border-t border-border bg-surface px-3 text-[11px] uppercase tracking-wide text-text-secondary">
      <div className="flex min-w-0 items-center gap-3">
        <span className="truncate">
          {t('statusBar.workspace')}: {note?.workspace ?? t('common.none')}
        </span>
        <span>{note?.language ?? 'markdown'}</span>
        <span className="inline-flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${statusColor[saveStatus]}`} />
          {t(`statusBar.${saveStatus === 'dirty' ? 'unsaved' : saveStatus}`)}
        </span>
        {cursorInfo ? (
          <>
            <span>{t('statusBar.line', { line: cursorInfo.line })}</span>
            <span>{t('statusBar.column', { col: cursorInfo.col })}</span>
            <span>{t('statusBar.words', { count: cursorInfo.wordCount })}</span>
            <span>{t('statusBar.chars', { count: cursorInfo.charCount })}</span>
          </>
        ) : null}
      </div>
      <span>{APP_VERSION}</span>
    </footer>
  )
}
