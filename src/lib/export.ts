import { save } from '@tauri-apps/plugin-dialog'
import { writeTextFile } from '@tauri-apps/plugin-fs'

import { replaceVariables, stringifyNote } from '@/lib/parser'
import type { Note } from '@/types'

function sanitizeFilename(input: string) {
  return input
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function baseName(note: Note) {
  return sanitizeFilename(note.title) || note.id
}

export async function exportAsMarkdown(
  note: Note,
  variables: Record<string, string>,
) {
  const path = await save({
    defaultPath: `${baseName(note)}.md`,
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  })

  if (!path) {
    return false
  }

  const payload = stringifyNote({
    ...note,
    content: replaceVariables(note.content, variables),
  })
  await writeTextFile(path, payload)
  return true
}

export async function exportAsTxt(
  note: Note,
  variables: Record<string, string>,
) {
  const path = await save({
    defaultPath: `${baseName(note)}.txt`,
    filters: [{ name: 'Text', extensions: ['txt'] }],
  })

  if (!path) {
    return false
  }

  await writeTextFile(path, replaceVariables(note.content, variables))
  return true
}

export async function exportAsJson(note: Note) {
  const path = await save({
    defaultPath: `${baseName(note)}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })

  if (!path) {
    return false
  }

  await writeTextFile(path, JSON.stringify(note, null, 2))
  return true
}
