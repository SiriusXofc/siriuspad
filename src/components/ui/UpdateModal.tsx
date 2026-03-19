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

  const handleInstall = async () => {
    setInstalling(true)

    try {
      await onInstall()
    } finally {
      setInstalling(false)
    }
  }

  return (
    <div className="absolute bottom-4 right-4 z-[75] w-[360px] rounded-xl border border-border bg-[#111111] p-4">
      {state.error ? (
        <>
          <p className="text-sm font-semibold text-text-primary">
            {t('updater.installFailed')}
          </p>
          <p className="mt-2 text-xs leading-6 text-text-secondary">
            {state.error}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-border bg-[#161616] px-3 py-2 text-xs text-text-primary transition hover:border-focus hover:bg-hover"
              onClick={() => void onRetry()}
            >
              {state.readyToInstall
                ? t('updater.installAndRestart')
                : t('common.confirm')}
            </button>
            <button
              type="button"
              className="rounded-md border border-border bg-transparent px-3 py-2 text-xs text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
              onClick={onDismiss}
            >
              {t('common.close')}
            </button>
          </div>
        </>
      ) : state.downloading ? (
        <>
          <p className="text-sm font-semibold text-text-primary">
            {t('updater.downloading', { progress: state.downloadProgress })}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full border border-border bg-[#0d0d0d]">
            <div
              className="h-full bg-accent transition-[width] duration-200"
              style={{ width: `${state.downloadProgress}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-end">
            <button
              type="button"
              className="rounded-md border border-border bg-transparent px-3 py-2 text-xs text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
              onClick={onDismiss}
            >
              {t('common.cancel')}
            </button>
          </div>
        </>
      ) : state.readyToInstall && state.available ? (
        <>
          <p className="text-sm font-semibold text-text-primary">
            {t('updater.readyToInstall')}
          </p>
          <p className="mt-2 text-xs leading-6 text-text-secondary">
            {t('updater.available', { version: state.available.version })}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-[#161616] px-3 py-2 text-xs text-text-primary transition hover:border-focus hover:bg-hover disabled:opacity-50"
              onClick={() => void handleInstall()}
              disabled={installing}
            >
              {installing ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              {t('updater.installAndRestart')}
            </button>
            <button
              type="button"
              className="rounded-md border border-border bg-transparent px-3 py-2 text-xs text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
              onClick={onDismiss}
            >
              {t('common.close')}
            </button>
          </div>
        </>
      ) : state.available ? (
        <>
          <p className="text-sm font-semibold text-text-primary">
            {t('updater.available', { version: state.available.version })}
          </p>
          <p className="mt-2 text-xs leading-6 text-text-secondary">
            {state.available.body?.trim() || t('updater.description')}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-border bg-[#161616] px-3 py-2 text-xs text-text-primary transition hover:border-focus hover:bg-hover"
              onClick={() => void onDownload()}
            >
              {t('updater.updateNow')}
            </button>
            <button
              type="button"
              className="rounded-md border border-border bg-transparent px-3 py-2 text-xs text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
              onClick={() =>
                void open(
                  `https://github.com/Nic85796/siriuspad/releases/tag/v${state.available?.version}`,
                )
              }
            >
              {t('updater.viewRelease')}
            </button>
            <button
              type="button"
              className="ml-auto rounded-md border border-border bg-transparent px-3 py-2 text-xs text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
              onClick={onDismiss}
            >
              {t('updater.later')}
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
