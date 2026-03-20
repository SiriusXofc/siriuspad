import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { useEffect, useState } from 'react'

import type { UpdateInfo } from '@/types'

export interface UpdateState {
  available: UpdateInfo | null
  downloading: boolean
  downloadProgress: number
  readyToInstall: boolean
  error: string | null
}

interface UpdateProgressPayload {
  downloaded: number
  total: number | null
  progress: number
}

const INITIAL_STATE: UpdateState = {
  available: null,
  downloading: false,
  downloadProgress: 0,
  readyToInstall: false,
  error: null,
}

export function useUpdater(enabled = true) {
  const [state, setState] = useState<UpdateState>(INITIAL_STATE)

  useEffect(() => {
    if (!enabled) {
      return
    }

    let disposed = false

    const checkForUpdates = async () => {
      try {
        const update = await invoke<UpdateInfo | null>('check_for_update')
        if (!update || disposed) {
          return
        }

        setState((current) => {
          if (
            current.available?.version === update.version ||
            current.downloading ||
            current.readyToInstall
          ) {
            return current
          }

          return {
            ...current,
            available: update,
            error: null,
          }
        })
      } catch (error) {
        console.warn('Updater check unavailable', error)
      }
    }

    const timeoutId = window.setTimeout(() => {
      void checkForUpdates()
    }, 1500)

    const onFocus = () => {
      void checkForUpdates()
    }

    window.addEventListener('focus', onFocus)

    return () => {
      disposed = true
      window.clearTimeout(timeoutId)
      window.removeEventListener('focus', onFocus)
    }
  }, [enabled])

  useEffect(() => {
    const setupProgressListener = async () => {
      return listen<UpdateProgressPayload>(
        'tauri://update-download-progress',
        (event) => {
          setState((current) => ({
            ...current,
            downloading: true,
            downloadProgress: event.payload.progress,
            error: null,
          }))
        },
      )
    }

    let unlisten: (() => void) | undefined

    void setupProgressListener().then((listener) => {
      unlisten = listener
    })

    return () => {
      unlisten?.()
    }
  }, [])

  const dismiss = () => {
    setState(INITIAL_STATE)
  }

  const startDownload = async () => {
    if (!state.available) {
      return
    }

    setState((current) => ({
      ...current,
      downloading: true,
      downloadProgress: 0,
      readyToInstall: false,
      error: null,
    }))

    try {
      const update = await invoke<UpdateInfo>('download_update')
      setState({
        available: update,
        downloading: false,
        downloadProgress: 100,
        readyToInstall: true,
        error: null,
      })
    } catch (error) {
      setState((current) => ({
        ...current,
        downloading: false,
        error: error instanceof Error ? error.message : String(error),
      }))
    }
  }

  const installUpdate = async () => {
    setState((current) => ({
      ...current,
      error: null,
    }))

    try {
      await invoke('install_update')
    } catch (error) {
      setState((current) => ({
        ...current,
        readyToInstall: true,
        error: error instanceof Error ? error.message : String(error),
      }))
      throw error
    }
  }

  const retry = async () => {
    if (state.readyToInstall) {
      await installUpdate()
      return
    }

    await startDownload()
  }

  return {
    state,
    dismiss,
    retry,
    startDownload,
    installUpdate,
  }
}
