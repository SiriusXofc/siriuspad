import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { FitAddon } from '@xterm/addon-fit'
import {
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Play,
  RotateCcw,
  Square,
  SquareTerminal,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Terminal as XTerm } from 'xterm'

import { EXECUTABLE_LANGUAGES } from '@/lib/constants'
import type { AppPlatform, RunResult } from '@/types'

import 'xterm/css/xterm.css'

interface TerminalSessionInfo {
  sessionId: string
  shell: string
}

interface TerminalDataPayload {
  sessionId: string
  data: string
}

interface TerminalExitPayload {
  sessionId: string
}

type TerminalSeed =
  | {
      id: number
      kind: 'command'
      value: string
    }
  | {
      id: number
      kind: 'snippet'
      code: string
      language: string | null
    }

interface TerminalProps {
  platform: AppPlatform
  noteDirectory: string | null
  open: boolean
  height: number
  canRunSnippet: boolean
  seedCommand: TerminalSeed | null
  runner: {
    result: RunResult | null
    running: boolean
    timeoutSeconds: number
    lastRun: {
      id: string
      label: string
      language: string
      source: 'note' | 'block'
    } | null
    run: () => Promise<void>
    runSnippet: (input: {
      code: string
      language: string
      label?: string
      source?: 'note' | 'block'
      cwd?: string | null
    }) => Promise<void>
    clear: () => void
    setTimeoutSeconds: (value: number) => void
  }
  onOpenChange: (open: boolean) => void
  onHeightChange: (height: number) => void
}

function shellNameForPlatform(platform: AppPlatform) {
  return platform === 'windows' ? 'cmd.exe' : 'bash'
}

function formatPath(platform: AppPlatform, path: string) {
  if (!path) {
    return path
  }

  if (platform === 'windows') {
    return path.replace(/^[A-Za-z]:\\Users\\[^\\]+/i, '~')
  }

  return path
    .replace(/^\/home\/[^/]+/, '~')
    .replace(/^\/Users\/[^/]+/, '~')
}

function writeAnsiLine(
  terminal: XTerm,
  text: string,
  color: 'muted' | 'stdout' | 'stderr' | 'accent' = 'muted',
) {
  if (!text) {
    return
  }

  const tone =
    color === 'stdout'
      ? '\x1b[32m'
      : color === 'stderr'
        ? '\x1b[31m'
        : color === 'accent'
          ? '\x1b[35m'
          : '\x1b[90m'

  terminal.write(`\r\n${tone}${text}\x1b[0m\r\n`)
}

export function Terminal({
  platform,
  noteDirectory,
  open,
  height,
  canRunSnippet,
  seedCommand,
  runner,
  onOpenChange,
  onHeightChange,
}: TerminalProps) {
  const { t } = useTranslation()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const resizeStateRef = useRef<{ startY: number; startHeight: number } | null>(null)
  const termRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const handledSeedRef = useRef<number | null>(null)
  const startedRunRef = useRef<string | null>(null)
  const finishedRunRef = useRef<string | null>(null)
  const [shellName, setShellName] = useState(shellNameForPlatform(platform))
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionClosed, setSessionClosed] = useState(false)

  const displayNoteDirectory = noteDirectory
    ? formatPath(platform, noteDirectory)
    : formatPath(platform, platform === 'windows' ? '%USERPROFILE%' : '~')

  const shellLabel = useMemo(() => shellNameForPlatform(platform), [platform])

  const focusTerminal = () => {
    window.setTimeout(() => {
      termRef.current?.focus()
    }, 0)
  }

  const resizeTerminal = () => {
    const terminal = termRef.current
    const fitAddon = fitAddonRef.current
    const sessionId = sessionIdRef.current
    if (!terminal || !fitAddon) {
      return
    }

    fitAddon.fit()

    if (sessionId) {
      void invoke('terminal_resize', {
        sessionId,
        cols: terminal.cols,
        rows: terminal.rows,
      }).catch((error) => {
        console.warn('Unable to resize terminal session', error)
      })
    }
  }

  const clearViewport = () => {
    termRef.current?.clear()
  }

  const interruptTerminal = async () => {
    if (!sessionIdRef.current) {
      return
    }

    try {
      await invoke('terminal_interrupt', {
        sessionId: sessionIdRef.current,
      })
      focusTerminal()
    } catch (error) {
      console.warn('Unable to interrupt terminal', error)
    }
  }

  useEffect(() => {
    if (!open) {
      return
    }

    const onMouseMove = (event: MouseEvent) => {
      if (!resizeStateRef.current) {
        return
      }

      const delta = resizeStateRef.current.startY - event.clientY
      const nextHeight = Math.min(
        520,
        Math.max(220, resizeStateRef.current.startHeight + delta),
      )
      onHeightChange(nextHeight)
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
  }, [onHeightChange, open])

  useEffect(() => {
    if (!open || !hostRef.current) {
      return
    }

    let disposed = false
    let unlistenData: (() => void) | undefined
    let unlistenExit: (() => void) | undefined

    const terminal = new XTerm({
      allowTransparency: false,
      convertEol: true,
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: 'JetBrains Mono, Fira Code, Cascadia Code, monospace',
      fontSize: 12,
      scrollback: 4000,
      theme: {
        background: '#0a0a0a',
        foreground: '#e0e0e0',
        cursor: '#7c3aed',
        selectionBackground: '#222222',
        black: '#0a0a0a',
        red: '#f87171',
        green: '#34d399',
        yellow: '#fbbf24',
        blue: '#60a5fa',
        magenta: '#a78bfa',
        cyan: '#22d3ee',
        white: '#e0e0e0',
        brightBlack: '#666666',
        brightRed: '#fca5a5',
        brightGreen: '#6ee7b7',
        brightYellow: '#fde68a',
        brightBlue: '#93c5fd',
        brightMagenta: '#c4b5fd',
        brightCyan: '#67e8f9',
        brightWhite: '#f5f5f5',
      },
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(hostRef.current)

    termRef.current = terminal
    fitAddonRef.current = fitAddon
    startedRunRef.current = null
    finishedRunRef.current = null

    const resetStateTimeout = window.setTimeout(() => {
      setSessionReady(false)
      setSessionClosed(false)
      setShellName(shellLabel)
    }, 0)

    fitAddon.fit()
    focusTerminal()

    const disposeData = terminal.onData((data) => {
      if (!sessionIdRef.current) {
        return
      }

      void invoke('terminal_write', {
        sessionId: sessionIdRef.current,
        data,
      }).catch((error) => {
        console.warn('Unable to write to terminal session', error)
      })
    })

    const disposeResize = terminal.onResize(({ cols, rows }) => {
      if (!sessionIdRef.current) {
        return
      }

      void invoke('terminal_resize', {
        sessionId: sessionIdRef.current,
        cols,
        rows,
      }).catch((error) => {
        console.warn('Unable to resize terminal session', error)
      })
    })

    const resizeObserver = new ResizeObserver(() => {
      resizeTerminal()
    })
    resizeObserver.observe(hostRef.current)
    resizeObserverRef.current = resizeObserver

    const setupSession = async () => {
      try {
        unlistenData = await listen<TerminalDataPayload>('terminal://data', (event) => {
          if (event.payload.sessionId !== sessionIdRef.current) {
            return
          }

          terminal.write(event.payload.data)
        })

        unlistenExit = await listen<TerminalExitPayload>('terminal://exit', (event) => {
          if (event.payload.sessionId !== sessionIdRef.current) {
            return
          }

          sessionIdRef.current = null
          setSessionReady(false)
          setSessionClosed(true)
          writeAnsiLine(terminal, t('terminal.sessionEnded'), 'muted')
        })

        const session = await invoke<TerminalSessionInfo>('terminal_create_session', {
          cwd: noteDirectory,
          cols: terminal.cols,
          rows: terminal.rows,
        })

        if (disposed) {
          await invoke('terminal_close_session', { sessionId: session.sessionId }).catch(
            () => {},
          )
          return
        }

        sessionIdRef.current = session.sessionId
        setShellName(session.shell)
        setSessionReady(true)
        writeAnsiLine(
          terminal,
          t('terminal.sessionReady', {
            shell: session.shell,
            cwd: displayNoteDirectory,
          }),
          'accent',
        )
        focusTerminal()
      } catch (error) {
        writeAnsiLine(
          terminal,
          error instanceof Error ? error.message : String(error),
          'stderr',
        )
      }
    }

    void setupSession()

    return () => {
      disposed = true
      resizeObserver.disconnect()
      resizeObserverRef.current = null
      window.clearTimeout(resetStateTimeout)
      disposeData.dispose()
      disposeResize.dispose()
      unlistenData?.()
      unlistenExit?.()
      const sessionId = sessionIdRef.current
      sessionIdRef.current = null
      setSessionReady(false)
      setSessionClosed(false)
      termRef.current = null
      fitAddonRef.current = null
      terminal.dispose()

      if (sessionId) {
        void invoke('terminal_close_session', { sessionId }).catch(() => {})
      }
    }
  }, [displayNoteDirectory, noteDirectory, open, platform, shellLabel, t])

  useEffect(() => {
    resizeTerminal()
  }, [height])

  useEffect(() => {
    if (!open || !seedCommand) {
      return
    }

    if (handledSeedRef.current === seedCommand.id) {
      return
    }

    handledSeedRef.current = seedCommand.id

    const terminal = termRef.current
    if (!terminal) {
      return
    }

    const handleSeed = async () => {
      focusTerminal()

      if (seedCommand.kind === 'command') {
        if (!sessionIdRef.current) {
          return
        }

        await invoke('terminal_write', {
          sessionId: sessionIdRef.current,
          data: seedCommand.value,
        })
        return
      }

      if (!seedCommand.language) {
        writeAnsiLine(terminal, t('terminal.blockMissingLanguage'), 'muted')
        return
      }

      if (!EXECUTABLE_LANGUAGES.has(seedCommand.language.toLowerCase())) {
        writeAnsiLine(
          terminal,
          t('terminal.blockUnsupported', { language: seedCommand.language }),
          'muted',
        )
        return
      }

      await runner.runSnippet({
        code: seedCommand.code,
        language: seedCommand.language,
        label: t('terminal.codeBlockLabel', { language: seedCommand.language }),
        source: 'block',
        cwd: noteDirectory,
      })
    }

    void handleSeed()
  }, [noteDirectory, open, runner, seedCommand, t])

  useEffect(() => {
    if (!open || !termRef.current || !sessionReady || !runner.running || !runner.lastRun) {
      return
    }

    if (startedRunRef.current === runner.lastRun.id) {
      return
    }

    startedRunRef.current = runner.lastRun.id
    writeAnsiLine(
      termRef.current,
      runner.lastRun.source === 'block'
        ? t('terminal.runningBlock', { language: runner.lastRun.language })
        : t('terminal.runningNote', {
            title: runner.lastRun.label,
            language: runner.lastRun.language,
          }),
      'accent',
    )
  }, [open, runner.lastRun, runner.running, sessionReady, t])

  useEffect(() => {
    if (!open || !termRef.current || !runner.result || !runner.lastRun) {
      return
    }

    if (finishedRunRef.current === runner.lastRun.id) {
      return
    }

    finishedRunRef.current = runner.lastRun.id

    if (runner.result.stdout.trim()) {
      writeAnsiLine(termRef.current, runner.result.stdout.trimEnd(), 'stdout')
    }

    if (runner.result.stderr.trim()) {
      writeAnsiLine(termRef.current, runner.result.stderr.trimEnd(), 'stderr')
    }

    writeAnsiLine(
      termRef.current,
      t('terminal.snippetFinished', {
        code: runner.result.exit_code,
        ms: runner.result.duration_ms,
      }),
      'muted',
    )
  }, [open, runner.lastRun, runner.result, t])

  if (!open) {
    return (
      <div className="border-t border-border bg-[#0c0c0c]">
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between px-3 text-[11px] uppercase tracking-[0.16em] text-text-secondary transition hover:bg-hover hover:text-text-primary"
          onClick={() => onOpenChange(true)}
          title={t('terminal.toggle')}
        >
          <span className="inline-flex items-center gap-2">
            <SquareTerminal className="h-3.5 w-3.5" />
            {t('terminal.title')}
          </span>
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <section
      className="relative border-t border-border bg-[#090909]"
      style={{ height }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1 cursor-row-resize bg-transparent hover:bg-[var(--accent-subtle)]"
        onMouseDown={(event) => {
          resizeStateRef.current = {
            startY: event.clientY,
            startHeight: height,
          }
        }}
      />

      <div className="flex h-full min-h-0 flex-col pt-1">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-2.5">
          <div className="min-w-0 space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-text-secondary">
              <span
                className={`h-2 w-2 rounded-full ${
                  sessionReady ? 'bg-[#34d399]' : sessionClosed ? 'bg-[#f87171]' : 'bg-accent'
                }`}
              />
              <span>{t('terminal.title')}</span>
              <span className="rounded-md border border-border bg-[#111111] px-2 py-1 text-[10px] text-text-secondary">
                {shellName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
              <span>{t('terminal.noteFolder')}</span>
              <span className="max-w-[560px] truncate rounded-md border border-border bg-[#111111] px-2 py-1 text-text-primary">
                {displayNoteDirectory}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canRunSnippet ? (
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-[#111111] px-3 text-[11px] text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary disabled:opacity-40"
                onClick={() => void runner.run()}
                disabled={runner.running}
                title={t('terminal.runCurrentNote')}
              >
                {runner.running ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                {t('terminal.runCurrentNote')}
              </button>
            ) : null}

            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-[#111111] px-3 text-[11px] text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
              onClick={clearViewport}
              title={t('terminal.clear')}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t('terminal.clear')}
            </button>

            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-[#111111] px-3 text-[11px] text-text-secondary transition hover:border-[#4a2020] hover:bg-[#2d1515] hover:text-[#f87171] disabled:opacity-40"
              onClick={() => void interruptTerminal()}
              disabled={!sessionReady}
              title={t('terminal.stop')}
            >
              <Square className="h-3.5 w-3.5" />
              {t('terminal.stop')}
            </button>

            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-[#111111] text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
              onClick={() => onOpenChange(false)}
              title={t('terminal.toggle')}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 bg-[#0a0a0a] px-2 py-2">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-border bg-black">
            <div className="border-b border-border px-3 py-2 text-[11px] text-text-secondary">
              {sessionReady
                ? t('terminal.sessionReadyShort', { shell: shellName })
                : t('terminal.connecting', { shell: shellLabel })}
            </div>

            <div
              ref={hostRef}
              className="terminal-host min-h-0 flex-1 overflow-hidden px-2 py-2"
              onClick={focusTerminal}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
