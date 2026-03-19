import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { EXECUTABLE_LANGUAGES } from '@/lib/constants'
import { MarkdownPreview } from '@/components/editor/MarkdownPreview'
import { NoteEditor } from '@/components/editor/NoteEditor'
import { FrontmatterBar } from '@/components/editor/FrontmatterBar'
import { SnippetRunner } from '@/components/editor/SnippetRunner'
import type {
  CursorInfo,
  Note,
  PreviewMode,
  RunResult,
  Settings,
  Workspace,
} from '@/types'

interface EditorPaneProps {
  note: Note | null
  settings: Settings
  workspaces: Workspace[]
  allTags: string[]
  previewMode: PreviewMode
  previewSplitRatio: number
  findReplaceNonce: number
  runner: {
    result: RunResult | null
    running: boolean
    timeoutSeconds: number
    run: () => Promise<void>
    clear: () => void
    setTimeoutSeconds: (value: number) => void
  }
  onNoteChange: (patch: Partial<Note>) => void
  onContentChange: (value: string) => void
  onSave: () => Promise<void>
  onDelete: () => Promise<void>
  onTogglePin: () => Promise<void>
  onCreateNote: () => Promise<void>
  onCursorChange: (cursorInfo: CursorInfo) => void
  onPreviewModeChange: (mode: PreviewMode) => void
  onPreviewSplitRatioChange: (ratio: number) => void
  onOpenFindReplace: () => void
  onOpenHistory: () => void
}

export function EditorPane({
  note,
  settings,
  workspaces,
  allTags,
  previewMode,
  previewSplitRatio,
  findReplaceNonce,
  runner,
  onNoteChange,
  onContentChange,
  onSave,
  onDelete,
  onTogglePin,
  onCreateNote,
  onCursorChange,
  onPreviewModeChange,
  onPreviewSplitRatioChange,
  onOpenFindReplace,
  onOpenHistory,
}: EditorPaneProps) {
  const { t } = useTranslation()
  const resizeStateRef = useRef<{
    width: number
    startX: number
    startRatio: number
  } | null>(null)

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!resizeStateRef.current) {
        return
      }

      const delta = event.clientX - resizeStateRef.current.startX
      const ratio =
        (resizeStateRef.current.width * resizeStateRef.current.startRatio + delta) /
        resizeStateRef.current.width
      onPreviewSplitRatioChange(ratio)
    }

    const onMouseUp = () => {
      resizeStateRef.current = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [onPreviewSplitRatioChange])

  if (!note) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center bg-base">
        <div className="max-w-md rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center">
          <p className="text-sm font-semibold text-text-primary">
            {t('note.noActive')}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {t('note.noActiveDescription')}
          </p>
          <button
            type="button"
            className="mt-5 rounded-xl border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-accent/20"
            onClick={() => void onCreateNote()}
          >
            {t('note.createFirstAction')}
          </button>
        </div>
      </main>
    )
  }

  const showRunner = EXECUTABLE_LANGUAGES.has(note.language.toLowerCase())

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-base">
      <FrontmatterBar
        note={note}
        workspaces={workspaces}
        allTags={allTags}
        previewMode={previewMode}
        onChange={onNoteChange}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
        onPreviewModeChange={onPreviewModeChange}
        onOpenFindReplace={onOpenFindReplace}
        onOpenHistory={onOpenHistory}
      />

      <div className="relative flex min-h-0 flex-1">
        {previewMode !== 'preview' ? (
          <div
            className="min-w-0"
            style={{
              width: previewMode === 'split' ? `${previewSplitRatio * 100}%` : '100%',
            }}
          >
            <NoteEditor
              noteId={note.id}
              value={note.content}
              settings={settings}
              findReplaceNonce={findReplaceNonce}
              onChange={onContentChange}
              onSave={onSave}
              onRun={runner.run}
              onCursorChange={onCursorChange}
            />
          </div>
        ) : null}

        {previewMode === 'split' ? (
          <div
            className="w-1 cursor-col-resize bg-border hover:bg-accent/40"
            onMouseDown={(event) => {
              const container = event.currentTarget.parentElement
              if (!container) {
                return
              }

              resizeStateRef.current = {
                width: container.getBoundingClientRect().width,
                startX: event.clientX,
                startRatio: previewSplitRatio,
              }
            }}
          />
        ) : null}

        {previewMode !== 'editor' ? (
          <div
            className="min-w-0 border-l border-border"
            style={{
              width: previewMode === 'split' ? `${(1 - previewSplitRatio) * 100}%` : '100%',
            }}
          >
            <MarkdownPreview content={note.content} />
          </div>
        ) : null}
      </div>

      {showRunner ? (
        <SnippetRunner
          language={note.language}
          result={runner.result}
          running={runner.running}
          timeoutSeconds={runner.timeoutSeconds}
          onTimeoutChange={runner.setTimeoutSeconds}
          onRun={runner.run}
          onClear={runner.clear}
        />
      ) : null}
    </main>
  )
}
