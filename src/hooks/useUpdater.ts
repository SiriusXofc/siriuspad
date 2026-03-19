import { invoke } from '@tauri-apps/api/core'
import { useEffect, useRef } from 'react'

import { useUiStore } from '@/store/ui'
import type { UpdateInfo } from '@/types'

export function useUpdater(enabled = true) {
  const checkedRef = useRef(false)

  useEffect(() => {
    if (!enabled || checkedRef.current) {
      return
    }

    checkedRef.current = true

    const timeoutId = window.setTimeout(async () => {
      try {
        const update = await invoke<UpdateInfo | null>('check_for_update')
        if (!update) {
          return
        }

        const uiStore = useUiStore.getState()
        uiStore.setUpdateAvailable(update)
      } catch {
        // Fail silently when offline or when the updater endpoint is unavailable.
      }
    }, 3000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [enabled])
}
