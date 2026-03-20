import { open } from '@tauri-apps/plugin-shell'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { UpdateState } from '@/hooks/useUpdater'

interface UpdateModalProps {
  state: UpdateState
  onDismiss: () => void
  onDownload: () => Promise<void>
  onInstall: () => Promise<void>
  onRetry: () => Promise<void>
}

export function UpdateModal({
  state,
  onDismiss,
  onDownload,
  onInstall,
  onRetry,
}: UpdateModalProps) {
  const { t } = useTranslation()
  const [installing, setInstalling] = useState(false)

  if (!state.available && !state.error) {
    return null
  }

  const releaseUrl = state.available
    ? `https://github.com/Nic85796/siriuspad/releases/tag/v${state.available.version}`
    : 'https://github.com/Nic85796/siriuspad/releases/latest'

  const handleInstall = async () => {
    setInstalling(true)

    try {
      await onInstall()
    } finally {
      setInstalling(false)
    }
  }

  return (
    <div className="absolute inset-0 z-[85] flex items-center justify-center bg-black/80 px-5 py-8">
      <div className="w-full max-w-[760px] rounded-[12px] border border-[#2d2060] bg-[#111111] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-md border border-[#3a2c70] bg-[rgba(124,58,237,0.12)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#c4b5fd]">
              {t('updater.newVersionBadge')}
            </span>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
                {state.available
                  ? t('updater.available', { version: state.available.version })
                  : t('updater.installFailed')}
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary">
                {state.error
                  ? state.error
                  : state.available?.body?.trim() || t('updater.description')}
              </p>
            </div>
          </div>

          {state.available ? (
            <div className="min-w-[150px] rounded-lg border border-border bg-[#0d0d0d] px-4 py-3 text-right">
              <div className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                {t('updater.versionLabel')}
              </div>
              <div className="mt-2 text-3xl font-semibold text-text-primary">
                v{state.available.version}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-5 space-y-5">
          {state.downloading ? (
            <div className="rounded-lg border border-border bg-[#0d0d0d] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text-primary">
                  {t('updater.downloading', { progress: state.downloadProgress })}
                </p>
                <span className="text-xs uppercase tracking-[0.16em] text-text-secondary">
                  {t('updater.largeNotice')}
                </span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full border border-border bg-[#090909]">
                <div
                  className="h-full bg-accent transition-[width] duration-200"
                  style={{ width: `${state.downloadProgress}%` }}
                />
              </div>
            </div>
          ) : null}

          {state.readyToInstall && state.available ? (
            <div className="rounded-lg border border-[#2d2060] bg-[rgba(124,58,237,0.08)] p-4">
              <p className="text-base font-semibold text-text-primary">
                {t('updater.readyToInstall')}
              </p>
              <p className="mt-2 text-sm leading-7 text-text-secondary">
                {t('updater.restartNotice')}
              </p>
            </div>
          ) : null}

          {!state.downloading && !state.readyToInstall && state.available ? (
            <div className="rounded-lg border border-border bg-[#0d0d0d] p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-md border border-border bg-[#111111] px-3 py-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                    {t('updater.versionLabel')}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-text-primary">
                    v{state.available.version}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-[#111111] px-3 py-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                    {t('updater.updateActionLabel')}
                  </div>
                  <div className="mt-2 text-sm text-text-primary">
                    {t('updater.updateNow')}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-[#111111] px-3 py-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                    {t('updater.viewRelease')}
                  </div>
                  <div className="mt-2 text-sm text-text-primary">
                    GitHub Releases
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {state.error ? (
            <button
              type="button"
              className="rounded-md border border-border bg-[#161616] px-4 py-2.5 text-sm text-text-primary transition hover:border-focus hover:bg-hover"
              onClick={() => void onRetry()}
            >
              {state.readyToInstall
                ? t('updater.installAndRestart')
                : t('common.confirm')}
            </button>
          ) : state.readyToInstall ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-[#3a2c70] bg-[rgba(124,58,237,0.12)] px-4 py-2.5 text-sm text-text-primary transition hover:border-[#4a3590] hover:bg-[rgba(124,58,237,0.18)] disabled:opacity-50"
              onClick={() => void handleInstall()}
              disabled={installing}
            >
              {installing ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : null}
              {t('updater.installAndRestart')}
            </button>
          ) : state.available ? (
            <>
              <button
                type="button"
                className="rounded-md border border-[#3a2c70] bg-[rgba(124,58,237,0.12)] px-4 py-2.5 text-sm text-text-primary transition hover:border-[#4a3590] hover:bg-[rgba(124,58,237,0.18)]"
                onClick={() => void onDownload()}
              >
                {t('updater.updateNow')}
              </button>
              <button
                type="button"
                className="rounded-md border border-border bg-transparent px-4 py-2.5 text-sm text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
                onClick={() => void open(releaseUrl)}
              >
                {t('updater.viewRelease')}
              </button>
            </>
          ) : null}

          <button
            type="button"
            className="ml-auto rounded-md border border-border bg-transparent px-4 py-2.5 text-sm text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
            onClick={onDismiss}
          >
            {state.downloading ? t('common.cancel') : t('updater.later')}
          </button>
        </div>
      </div>
    </div>
  )
}
