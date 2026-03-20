import { Command, type Child } from '@tauri-apps/plugin-shell'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  LoaderCircle,
  Play,
  RotateCcw,
  Square,
  SquareTerminal,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { AppPlatform, RunResult } from '@/types'

type TerminalTab = 'terminal' | 'output'

interface TerminalEntry {
  id: string
  kind: 'command' | 'stdout' | 'stderr' | 'system'
  prompt?: string
  text: string
}

interface TerminalSeed {
  id: number
  value: string
}

interface TerminalProps {
  platform: AppPlatform
  language: string
  open: boolean
  height: number
  canRunSnippet: boolean
  seedCommand: TerminalSeed | null
  runner: {
    result: RunResult | null
    running: boolean
    timeoutSeconds: number
    run: () => Promise<void>
    clear: () => void
    setTimeoutSeconds: (value: number) => void
  }
  onOpenChange: (open: boolean) => void
  onHeightChange: (height: number) => void
}

function escapeUnixPath(path: string) {
  if (path === '~' || path.startsWith('~/')) {
    return path
  }

  return `'${path.replace(/'/g, `'\\''`)}'`
}

function escapeWindowsPath(path: string) {
  return `"${path.replace(/"/g, '\\"')}"`
}

function buildShellCommand(
  platform: AppPlatform,
  cwd: string,
  command: string,
): string {
  if (platform === 'windows') {
    const prefix = cwd ? `cd /d ${escapeWindowsPath(cwd)} && ` : ''
    return `${prefix}${command}`
  }

  const prefix = cwd ? `cd ${escapeUnixPath(cwd)} >/dev/null 2>&1 && ` : ''
  return `${prefix}${command}`
}

function normalizeCwd(platform: AppPlatform, current: string, input: string) {
  const target = input.trim()

  if (!target) {
    return platform === 'windows' ? '%USERPROFILE%' : '~'
  }

  if (platform === 'windows') {
    if (/^[a-z]:/i.test(target) || target.startsWith('%')) {
      return target
    }

    if (target === '..') {
      return current.replace(/[\\/][^\\/]+$/, '') || current
    }

    if (target === '.') {
      return current
    }

    return `${current.replace(/[\\/]+$/, '')}\\${target.replace(/[\\/]+/g, '\\')}`
  }

  if (target.startsWith('/') || target.startsWith('~')) {
    return target
  }

  if (target === '..') {
    if (current === '~') {
      return current
    }

    return current.replace(/\/[^/]+$/, '') || '/'
  }

  if (target === '.') {
    return current
  }

  return `${current.replace(/\/$/, '')}/${target}`
}

function createEntry(
  kind: TerminalEntry['kind'],
  text: string,
  prompt?: string,
): TerminalEntry {
  return {
    id: crypto.randomUUID(),
    kind,
    text,
    prompt,
  }
}

function createInitialEntries(readyText: string) {
  return [createEntry('system', readyText)]
}

export function Terminal({
  platform,
  language,
  open,
  height,
  canRunSnippet,
  seedCommand,
  runner,
  onOpenChange,
  onHeightChange,
}: TerminalProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<TerminalTab>('terminal')
  const [cwd, setCwd] = useState(
    platform === 'windows' ? '%USERPROFILE%' : '~',
  )
  const [inputValue, setInputValue] = useState('')
  const [entries, setEntries] = useState<TerminalEntry[]>(() =>
    createInitialEntries(t('terminal.ready')),
  )
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [processRunning, setProcessRunning] = useState(false)
  const resizeStateRef = useRef<{ startY: number; startHeight: number } | null>(null)
  const childRef = useRef<Child | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const promptRef = useRef<HTMLInputElement | null>(null)

  const hasOutput = useMemo(
    () => Boolean(runner.result?.stdout || runner.result?.stderr),
    [runner.result],
  )
  const quickActions = useMemo(
    () => [
      platform === 'windows' ? 'dir' : 'ls -la',
      'git status',
      'npm run dev',
      'clear',
    ],
    [platform],
  )

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
        360,
        Math.max(120, resizeStateRef.current.startHeight + delta),
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
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [entries, hasOutput, runner.running, runner.result, tab])

  useEffect(() => {
    if (!open) {
      return
    }

    promptRef.current?.focus()
  }, [open, tab])

  useEffect(() => {
    if (!seedCommand) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      onOpenChange(true)
      setTab('terminal')
      setInputValue(seedCommand.value)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [onOpenChange, seedCommand])

  useEffect(() => {
    if (runner.running || runner.result) {
      const timeoutId = window.setTimeout(() => {
        setTab('output')
      }, 0)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }
  }, [runner.result, runner.running])

  useEffect(() => {
    return () => {
      void childRef.current?.kill()
    }
  }, [])

  const appendEntry = (entry: TerminalEntry) => {
    setEntries((current) => [...current, entry])
  }

  const resetTerminal = () => {
    setEntries(createInitialEntries(t('terminal.ready')))
  }

  const handleCommand = async () => {
    const command = inputValue.trim()
    if (!command) {
      return
    }

    setInputValue('')
    setHistoryIndex(null)
    setTab('terminal')
    appendEntry(createEntry('command', command, cwd))
    setHistory((current) => [command, ...current.filter((item) => item !== command)].slice(0, 50))

    if (command.toLowerCase() === 'clear') {
      resetTerminal()
      return
    }

    if (/^cd(?:\s+.*)?$/i.test(command)) {
      const nextCwd = normalizeCwd(
        platform,
        cwd,
        command.replace(/^cd\s*/i, ''),
      )
      setCwd(nextCwd)
      appendEntry(
        createEntry('system', t('terminal.cwdChanged', { cwd: nextCwd })),
      )
      return
    }

    if (childRef.current) {
      appendEntry(
        createEntry('system', t('terminal.processRunning')),
      )
      return
    }

    const alias = platform === 'windows' ? 'terminal-cmd' : 'terminal-bash'
    const args =
      platform === 'windows'
        ? ['/C', buildShellCommand(platform, cwd, command)]
        : ['-lc', buildShellCommand(platform, cwd, command)]

    const shellCommand = Command.create(alias, args)

    shellCommand.stdout.on('data', (data) => {
      if (data.trim()) {
        appendEntry(createEntry('stdout', data))
      }
    })

    shellCommand.stderr.on('data', (data) => {
      if (data.trim()) {
        appendEntry(createEntry('stderr', data))
      }
    })

    shellCommand.on('close', ({ code, signal }) => {
      childRef.current = null
      setProcessRunning(false)
      appendEntry(
        createEntry(
          'system',
          t('terminal.processFinished', {
            code: code ?? 'null',
            signal: signal ? ` (signal ${signal})` : '',
          }),
        ),
      )
    })

    shellCommand.on('error', (error) => {
      childRef.current = null
      setProcessRunning(false)
      appendEntry(createEntry('stderr', error))
    })

    try {
      childRef.current = await shellCommand.spawn()
      setProcessRunning(true)
    } catch (error) {
      setProcessRunning(false)
      appendEntry(
        createEntry(
          'stderr',
          error instanceof Error ? error.message : String(error),
        ),
      )
    }
  }

  const clearCurrentTab = () => {
    if (tab === 'terminal') {
      resetTerminal()
      return
    }

    runner.clear()
  }

  const copyOutput = async () => {
    await navigator.clipboard.writeText(
      [runner.result?.stdout, runner.result?.stderr].filter(Boolean).join('\n\n'),
    )
  }

  const stopCurrentProcess = async () => {
    if (!childRef.current) {
      return
    }

    await childRef.current.kill()
    childRef.current = null
    setProcessRunning(false)
    appendEntry(createEntry('system', t('terminal.cancelled')))
  }

  if (!open) {
    return (
      <div className="border-t border-border bg-[#0f0f0f]">
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between px-3 text-[11px] uppercase tracking-[0.16em] text-text-secondary transition hover:bg-hover hover:text-text-primary"
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
      className="relative border-t border-border bg-[#0f0f0f]"
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

      <div className="flex h-full flex-col pt-1">
        <div className="flex h-10 items-center justify-between border-b border-border px-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex flex-col">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                <span
                  className={`h-2 w-2 rounded-full ${
                    processRunning || runner.running ? 'bg-accent' : 'bg-text-muted'
                  }`}
                />
                <span>{t('terminal.title')}</span>
              </div>
              <span className="text-[11px] text-text-muted">
                {t('terminal.subtitle')}
              </span>
            </div>
            <span className="truncate rounded-md border border-border bg-[#111111] px-2 py-1 text-[11px] text-text-secondary">
              {cwd}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-border bg-[#111111] p-1">
            {(['terminal', 'output'] as TerminalTab[]).map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-md px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] transition ${
                  tab === item
                    ? 'bg-[#222222] text-text-primary'
                    : 'text-text-secondary hover:bg-hover hover:text-text-primary'
                }`}
                onClick={() => setTab(item)}
              >
                {t(`terminal.${item}`)}
              </button>
            ))}
          </div>
 
            {tab === 'output' ? (
              <label className="inline-flex items-center gap-2 rounded-md border border-border bg-[#161616] px-2.5 py-1 text-[11px] text-text-secondary">
                <span>{t('terminal.timeout')}</span>
                <select
                  className="bg-transparent text-text-primary outline-none"
                  value={runner.timeoutSeconds}
                  onChange={(event) =>
                    runner.setTimeoutSeconds(Number(event.target.value))
                  }
                >
                  {[5, 10, 30, 60].map((seconds) => (
                    <option key={seconds} value={seconds}>
                      {seconds}s
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {tab === 'output' ? (
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-[#161616] px-2.5 text-[11px] text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary disabled:opacity-40"
                onClick={() => void runner.run()}
                disabled={!canRunSnippet || runner.running}
              >
                {runner.running ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                {t('terminal.run')}
              </button>
            ) : null}

            {tab === 'output' ? (
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-[#161616] px-2.5 text-[11px] text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary disabled:opacity-40"
                onClick={() => void copyOutput()}
                disabled={!runner.result}
              >
                <Copy className="h-3.5 w-3.5" />
                {t('common.copy')}
              </button>
            ) : null}

            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-[#161616] px-2.5 text-[11px] text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
              onClick={clearCurrentTab}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t('terminal.clear')}
            </button>

            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-[#161616] text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
              onClick={() => onOpenChange(false)}
              title={t('terminal.toggle')}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {tab === 'terminal' ? (
          <>
            <div
              ref={viewportRef}
              className="min-h-0 flex-1 overflow-y-auto bg-[#0b0b0b] px-3 py-3 font-mono text-xs"
            >
              <div className="grid gap-2">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`whitespace-pre-wrap rounded-md border px-3 py-2 leading-6 ${
                      entry.kind === 'command'
                        ? 'border-border bg-[#111111]'
                        : entry.kind === 'stdout'
                          ? 'border-[#153126] bg-[#101b15]'
                          : entry.kind === 'stderr'
                            ? 'border-[#402020] bg-[#1a1010]'
                            : 'border-border bg-[#0f0f0f]'
                    }`}
                  >
                    {entry.kind === 'command' ? (
                      <p className="text-text-primary">
                        <span className="text-text-secondary">{entry.prompt} $ </span>
                        {entry.text}
                      </p>
                    ) : entry.kind === 'stdout' ? (
                      <p className="text-[#34d399]">{entry.text}</p>
                    ) : entry.kind === 'stderr' ? (
                      <p className="text-[#f87171]">{entry.text}</p>
                    ) : (
                      <p className="text-text-secondary">{entry.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border bg-[#0f0f0f] px-3 py-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {quickActions.map((command) => (
                  <button
                    key={command}
                    type="button"
                    className="rounded-md border border-border bg-[#111111] px-2.5 py-1 text-[11px] text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
                    onClick={() => {
                      setInputValue(command)
                      promptRef.current?.focus()
                    }}
                  >
                    {command}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 rounded-md border border-border bg-[#0b0b0b] px-3 py-2 text-xs text-text-secondary">
                <span className="max-w-[40%] shrink-0 truncate rounded-sm border border-border bg-[#161616] px-2 py-1 text-[11px] text-text-secondary">
                  {cwd} $
                </span>
                <input
                  ref={promptRef}
                  className="w-full bg-transparent text-text-primary outline-none"
                  style={{ caretColor: 'var(--accent)' }}
                  value={inputValue}
                  onChange={(event) => {
                    setInputValue(event.target.value)
                    setHistoryIndex(null)
                  }}
                  onKeyDown={(event) => {
                    event.stopPropagation()

                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void handleCommand()
                    }

                    if (event.key.toLowerCase() === 'c' && event.ctrlKey && childRef.current) {
                      event.preventDefault()
                      void stopCurrentProcess()
                    }

                    if (event.key === 'ArrowUp') {
                      event.preventDefault()
                      if (!history.length) {
                        return
                      }

                      const nextIndex =
                        historyIndex === null
                          ? 0
                          : Math.min(historyIndex + 1, history.length - 1)
                      setHistoryIndex(nextIndex)
                      setInputValue(history[nextIndex] ?? '')
                    }

                    if (event.key === 'ArrowDown') {
                      event.preventDefault()
                      if (!history.length) {
                        return
                      }

                      if (historyIndex === null) {
                        setInputValue('')
                        return
                      }

                      const nextIndex = historyIndex - 1
                      if (nextIndex < 0) {
                        setHistoryIndex(null)
                        setInputValue('')
                        return
                      }

                      setHistoryIndex(nextIndex)
                      setInputValue(history[nextIndex] ?? '')
                    }
                  }}
                  placeholder={t('terminal.commandPlaceholder')}
                />
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-[#161616] px-2 text-[11px] text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary disabled:opacity-40"
                  onClick={() => void handleCommand()}
                  disabled={!inputValue.trim() || processRunning}
                >
                  <Play className="h-3.5 w-3.5" />
                  {t('terminal.run')}
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-[#161616] px-2 text-[11px] text-text-secondary transition hover:border-[#4a2020] hover:bg-[#2d1515] hover:text-[#f87171] disabled:opacity-40"
                  onClick={() => void stopCurrentProcess()}
                  disabled={!processRunning}
                >
                  <Square className="h-3.5 w-3.5" />
                  {t('terminal.stop')}
                </button>
              </label>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-text-secondary">
                <span>{t('terminal.runHint')}</span>
                <span>{t('terminal.historyHint')}</span>
              </div>
            </div>
          </>
        ) : (
          <div
            ref={viewportRef}
            className="grid min-h-0 flex-1 gap-3 overflow-y-auto bg-[#0d0d0d] px-3 py-3 lg:grid-cols-2"
          >
            <div className="rounded-md border border-border bg-[#111111] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                  {t('terminal.output')}
                </h3>
                <span className="text-[11px] text-text-secondary">{language}</span>
              </div>
              <pre className="max-h-28 overflow-auto whitespace-pre-wrap font-mono text-xs leading-6 text-[#34d399]">
                {runner.result?.stdout || t('terminal.noStdout')}
              </pre>
            </div>

            <div className="rounded-md border border-border bg-[#111111] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                  stderr
                </h3>
                {runner.result ? (
                  <span className="text-[11px] text-text-secondary">
                    exit {runner.result.exit_code}
                  </span>
                ) : null}
              </div>
              <pre className="max-h-28 overflow-auto whitespace-pre-wrap font-mono text-xs leading-6 text-[#f87171]">
                {runner.result?.stderr || t('terminal.noStderr')}
              </pre>
            </div>

            <div className="lg:col-span-2 flex flex-wrap items-center gap-3 rounded-md border border-border bg-[#101010] px-3 py-2 text-[11px] text-text-secondary">
              {runner.result ? (
                <>
                  <span>{t('runner.duration', { ms: runner.result.duration_ms })}</span>
                  {runner.result.timed_out ? (
                    <span className="text-[#fbbf24]">{t('runner.timedOut')}</span>
                  ) : null}
                </>
              ) : (
                <span>
                  {canRunSnippet
                    ? t('terminal.runHint')
                    : t('terminal.unsupportedHint')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
