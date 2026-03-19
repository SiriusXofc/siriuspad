import { Command, type Child } from '@tauri-apps/plugin-shell'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  LoaderCircle,
  Play,
  RotateCcw,
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
  const [entries, setEntries] = useState<TerminalEntry[]>([
    createEntry('system', 'Shell pronto. Digite um comando e pressione Enter.'),
  ])
  const resizeStateRef = useRef<{ startY: number; startHeight: number } | null>(null)
  const childRef = useRef<Child | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const promptRef = useRef<HTMLInputElement | null>(null)

  const hasOutput = useMemo(
    () => Boolean(runner.result?.stdout || runner.result?.stderr),
    [runner.result],
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

  const handleCommand = async () => {
    const command = inputValue.trim()
    if (!command) {
      return
    }

    setInputValue('')
    setTab('terminal')
    appendEntry(createEntry('command', command, cwd))

    if (command.toLowerCase() === 'clear') {
      setEntries([])
      return
    }

    if (/^cd(?:\s+.*)?$/i.test(command)) {
      const nextCwd = normalizeCwd(
        platform,
        cwd,
        command.replace(/^cd\s*/i, ''),
      )
      setCwd(nextCwd)
      appendEntry(createEntry('system', `Diretório atual: ${nextCwd}`))
      return
    }

    if (childRef.current) {
      appendEntry(
        createEntry('system', 'Já existe um processo em execução no terminal.'),
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
      appendEntry(
        createEntry(
          'system',
          `Processo finalizado com código ${code ?? 'null'}${
            signal ? ` (sinal ${signal})` : ''
          }.`,
        ),
      )
    })

    shellCommand.on('error', (error) => {
      childRef.current = null
      appendEntry(createEntry('stderr', error))
    })

    try {
      childRef.current = await shellCommand.spawn()
    } catch (error) {
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
      setEntries([])
      return
    }

    runner.clear()
  }

  const copyOutput = async () => {
    await navigator.clipboard.writeText(
      [runner.result?.stdout, runner.result?.stderr].filter(Boolean).join('\n\n'),
    )
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
        <div className="flex h-9 items-center justify-between border-b border-border px-3">
          <div className="flex items-center gap-1">
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

          <div className="flex items-center gap-2">
            {tab === 'output' ? (
              <label className="inline-flex items-center gap-2 rounded-md border border-border bg-[#161616] px-2.5 py-1 text-[11px] text-text-secondary">
                <span>timeout</span>
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
                Copiar
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
              className="min-h-0 flex-1 overflow-y-auto px-3 py-3 font-mono text-xs"
            >
              <div className="grid gap-2">
                {entries.map((entry) => (
                  <div key={entry.id} className="whitespace-pre-wrap leading-6">
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

            <div className="border-t border-border px-3 py-2">
              <label className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="shrink-0">{cwd} $</span>
                <input
                  ref={promptRef}
                  className="w-full bg-transparent text-text-primary outline-none"
                  style={{ caretColor: 'var(--accent)' }}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    event.stopPropagation()

                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void handleCommand()
                    }

                    if (event.key.toLowerCase() === 'c' && event.ctrlKey && childRef.current) {
                      event.preventDefault()
                      void childRef.current.kill()
                      childRef.current = null
                      appendEntry(createEntry('system', 'Processo cancelado via Ctrl+C.'))
                    }
                  }}
                  placeholder="Digite um comando..."
                />
              </label>
            </div>
          </>
        ) : (
          <div
            ref={viewportRef}
            className="grid min-h-0 flex-1 gap-3 overflow-y-auto px-3 py-3"
          >
            <div className="rounded-lg border border-border bg-[#111111] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                  {t('terminal.output')}
                </h3>
                <span className="text-[11px] text-text-secondary">{language}</span>
              </div>
              <pre className="max-h-28 overflow-auto whitespace-pre-wrap font-mono text-xs leading-6 text-[#34d399]">
                {runner.result?.stdout || 'Sem stdout ainda.'}
              </pre>
            </div>

            <div className="rounded-lg border border-border bg-[#111111] p-3">
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
                {runner.result?.stderr || 'Sem stderr ainda.'}
              </pre>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-secondary">
              {runner.result ? (
                <>
                  <span>Duração: {runner.result.duration_ms}ms</span>
                  {runner.result.timed_out ? (
                    <span className="text-[#fbbf24]">Tempo limite atingido.</span>
                  ) : null}
                </>
              ) : (
                <span>
                  {canRunSnippet
                    ? 'Use Ctrl+Enter para executar o conteúdo da nota.'
                    : 'A saída aparece aqui quando a linguagem da nota suporta execução.'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
