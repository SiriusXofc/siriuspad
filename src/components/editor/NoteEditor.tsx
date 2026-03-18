import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useEffect, useRef, type CSSProperties } from 'react'

import {
  createEditorCompartments,
  createEditorExtensions,
  getCursorInfo,
  openEditorSearchPanel,
  reconfigureLineNumbers,
  reconfigureTabSize,
  reconfigureWordWrap,
} from '@/lib/codemirror'
import type { CursorInfo, Settings } from '@/types'

interface NoteEditorProps {
  noteId: string
  value: string
  settings: Settings
  findReplaceNonce?: number
  onChange: (value: string) => void
  onSave: () => void | Promise<void>
  onRun: () => void | Promise<void>
  onCursorChange?: (cursorInfo: CursorInfo) => void
}

export function NoteEditor({
  noteId,
  value,
  settings,
  findReplaceNonce = 0,
  onChange,
  onSave,
  onRun,
  onCursorChange,
}: NoteEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const compartmentsRef = useRef(createEditorCompartments())
  const handlersRef = useRef({ onChange, onSave, onRun, onCursorChange })

  handlersRef.current = { onChange, onSave, onRun, onCursorChange }

  useEffect(() => {
    if (!hostRef.current) {
      return
    }

    viewRef.current?.destroy()
    hostRef.current.innerHTML = ''

    const state = EditorState.create({
      doc: value,
      extensions: createEditorExtensions(
        settings,
        {
          onChange: (nextValue) => handlersRef.current.onChange(nextValue),
          onSave: () => handlersRef.current.onSave(),
          onRun: () => handlersRef.current.onRun(),
          onCursorChange: (cursorInfo) => handlersRef.current.onCursorChange?.(cursorInfo),
        },
        compartmentsRef.current,
      ),
    })

    const view = new EditorView({
      state,
      parent: hostRef.current,
    })

    viewRef.current = view
    handlersRef.current.onCursorChange?.(getCursorInfo(view))

    return () => {
      view.destroy()
    }
  }, [noteId])

  useEffect(() => {
    const view = viewRef.current
    if (!view) {
      return
    }

    view.dispatch({
      effects: reconfigureLineNumbers(
        compartmentsRef.current,
        settings.showLineNumbers,
      ),
    })
  }, [settings.showLineNumbers])

  useEffect(() => {
    const view = viewRef.current
    if (!view) {
      return
    }

    view.dispatch({
      effects: reconfigureWordWrap(compartmentsRef.current, settings.wordWrap),
    })
  }, [settings.wordWrap])

  useEffect(() => {
    const view = viewRef.current
    if (!view) {
      return
    }

    view.dispatch({
      effects: reconfigureTabSize(compartmentsRef.current, settings.tabSize),
    })
  }, [settings.tabSize])

  useEffect(() => {
    const view = viewRef.current
    if (!view) {
      return
    }

    const currentValue = view.state.doc.toString()
    if (currentValue === value) {
      return
    }

    view.dispatch({
      changes: {
        from: 0,
        to: currentValue.length,
        insert: value,
      },
    })
  }, [value])

  useEffect(() => {
    const view = viewRef.current
    if (!view || !findReplaceNonce) {
      return
    }

    openEditorSearchPanel(view)
  }, [findReplaceNonce])

  return (
    <div
      className="relative min-h-0 flex-1 overflow-hidden bg-base"
      style={
        {
          '--editor-font-family': `"${settings.fontFamily}", monospace`,
          '--editor-font-size': `${settings.fontSize}px`,
        } as CSSProperties
      }
    >
      <div ref={hostRef} className="h-full" />
    </div>
  )
}
