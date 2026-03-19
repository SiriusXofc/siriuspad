import { invoke } from '@tauri-apps/api/core'
import { useState } from 'react'

import i18n from '@/i18n'
import { EXECUTABLE_LANGUAGES } from '@/lib/constants'
import { replaceVariables } from '@/lib/parser'
import type { Note, RunResult } from '@/types'

export function useRunner(
  note: Note | null,
  variables: Record<string, string>,
) {
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [timeoutSeconds, setTimeoutSeconds] = useState(10)

  const canRun = Boolean(
    note && EXECUTABLE_LANGUAGES.has(note.language.toLowerCase()),
  )

  async function run() {
    if (!note || !canRun) {
      return
    }

    setRunning(true)

    try {
      const output = await invoke<RunResult>('run_snippet', {
        code: replaceVariables(note.content, variables),
        language: note.language,
        envVars: variables,
        timeoutSecs: timeoutSeconds,
      })
      setResult(output)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : `${error ?? ''}`.trim()
      const stderr = message.toLowerCase().includes('no interpreter found')
        ? i18n.t('runner.noInterpreter', { language: note.language })
        : message || i18n.t('common.unknownError')

      setResult({
        stdout: '',
        stderr,
        exit_code: -1,
        duration_ms: 0,
        timed_out: false,
      })
    } finally {
      setRunning(false)
    }
  }

  function clear() {
    setResult(null)
  }

  return {
    canRun,
    result,
    running,
    timeoutSeconds,
    run,
    clear,
    setTimeoutSeconds,
  }
}
