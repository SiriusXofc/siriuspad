import type { TFunction } from 'i18next'

import { DEFAULT_WORKSPACE_ID } from '@/lib/constants'
import type { Workspace } from '@/types'

export const LEGACY_DEFAULT_WORKSPACE_ID = 'geral'

export function isDefaultWorkspaceId(value: string) {
  return value === DEFAULT_WORKSPACE_ID || value === LEGACY_DEFAULT_WORKSPACE_ID
}

export function normalizeWorkspaceId(value: string) {
  return isDefaultWorkspaceId(value) ? DEFAULT_WORKSPACE_ID : value
}

export function getWorkspaceDisplayName(
  workspace: Pick<Workspace, 'id' | 'name'>,
  t: TFunction,
) {
  return isDefaultWorkspaceId(workspace.id) || isDefaultWorkspaceId(workspace.name)
    ? t('workspace.default')
    : workspace.name
}

export function getWorkspaceNameFromId(id: string, t: TFunction) {
  return isDefaultWorkspaceId(id) ? t('workspace.default') : id
}
