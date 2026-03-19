import { Copy, LoaderCircle, Play, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { RunResult } from '@/types'

interface SnippetRunnerProps {
  language: string
  result: RunResult | null
  running: boolean
  timeoutSeconds: number
  onTimeoutChange: (value: number) => void
  onRun: () => Promise<void>
  onClear: () => void
}

export function SnippetRunner({
  language,
  result,
  running,
  timeoutSeconds,
  onTimeoutChange,
  onRun,
  onClear,
}: SnippetRunnerProps) {
  const { t } = useTranslation()

  return (
    <div className="border-t border-border bg-surface px-4 py-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
            {t('runner.title')}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {t('runner.readyDescription', { language })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-lg border border-border bg-base px-3 py-2 text-sm text-text-secondary">
            <span>{t('runner.timeout')}</span>
            <select
              className="bg-transparent text-text-primary outline-none"
              value={timeoutSeconds}
              onChange={(event) => onTimeoutChange(Number(event.target.value))}
            >
              {[5, 10, 30, 60].map((seconds) => (
                <option key={seconds} value={seconds}>
                  {seconds}s
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-base px-3 py-2 text-sm text-text-primary transition hover:border-focus hover:bg-hover"
            onClick={() => void onRun()}
            disabled={running}
            title={t('runner.runShortcut')}
          >
            {running ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running ? t('runner.running') : t('runner.runShortcut')}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-base px-3 py-2 text-sm text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
            onClick={onClear}
            title={t('runner.clearOutput')}
          >
            <RotateCcw className="h-4 w-4" />
            {t('runner.clearOutput')}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-base px-3 py-2 text-sm text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
            onClick={() =>
              void navigator.clipboard.writeText(
                [result?.stdout, result?.stderr].filter(Boolean).join('\n\n'),
              )
            }
            disabled={!result}
            title={t('runner.copyOutput')}
          >
            <Copy className="h-4 w-4" />
            {t('runner.copyOutput')}
          </button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-[#0a0a0a] p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
            {t('runner.stdout')}
          </h3>
          <pre className="max-h-52 overflow-auto whitespace-pre-wrap font-mono text-xs leading-6 text-green">
            {result?.stdout || t('runner.noStdout')}
          </pre>
        </section>
        <section className="rounded-xl border border-border bg-[#0a0a0a] p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
            {t('runner.stderr')}
          </h3>
          <pre className="max-h-52 overflow-auto whitespace-pre-wrap font-mono text-xs leading-6 text-red">
            {result?.stderr || t('runner.noStderr')}
          </pre>
        </section>
      </div>

      {result ? (
        <div className="mt-3 flex items-center gap-3 text-xs text-text-secondary">
          <span>{t('runner.exitCode', { code: result.exit_code })}</span>
          <span>{t('runner.duration', { ms: result.duration_ms })}</span>
          {result.timed_out ? <span className="text-yellow">{t('runner.timedOut')}</span> : null}
        </div>
      ) : null}
    </div>
  )
}
