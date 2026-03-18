import { Command } from 'cmdk'
import { Search } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import type { CommandItem } from '@/types'

interface CommandPaletteProps {
  open: boolean
  commands: CommandItem[]
  commandHistory: string[]
  onOpenChange: (open: boolean) => void
  onCommandRun: (commandId: string) => Promise<void>
}

export function CommandPalette({
  open,
  commands,
  commandHistory,
  onOpenChange,
  onCommandRun,
}: CommandPaletteProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange])

  if (!open || typeof document === 'undefined') {
    return null
  }

  const recents = commandHistory
    .map((id) => commands.find((command) => command.id === id))
    .filter((command): command is CommandItem => Boolean(command))
  const recentIds = new Set(recents.map((command) => command.id))
  const grouped = commands
    .filter((command) => !recentIds.has(command.id))
    .reduce<Record<string, CommandItem[]>>((accumulator, command) => {
      accumulator[command.group] ??= []
      accumulator[command.group].push(command)
      return accumulator
    }, {})

  const runCommand = async (command: CommandItem) => {
    await command.perform()
    await onCommandRun(command.id)
    onOpenChange(false)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-sm"
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-elevated shadow-accent"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Command
          loop
          label={t('commands.commandPalette')}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-4">
            <Search className="h-4 w-4 text-text-secondary" />
            <Command.Input
              autoFocus
              placeholder={t('searchPanel.placeholder')}
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-sm text-text-secondary">
              {t('searchPanel.empty')}
            </Command.Empty>

            {recents.length ? (
              <Command.Group heading={t('searchPanel.recent')} className="command-group">
                {recents.map((command) => (
                  <Command.Item
                    key={command.id}
                    value={[command.label, command.keywords?.join(' ')]
                      .filter(Boolean)
                      .join(' ')}
                    className="command-item"
                    onSelect={() => void runCommand(command)}
                  >
                    {command.label}
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}

            {Object.entries(grouped).map(([group, groupCommands]) =>
              groupCommands.length ? (
                <Command.Group key={group} heading={group} className="command-group">
                  {groupCommands.map((command) => (
                    <Command.Item
                      key={command.id}
                      value={[command.label, command.keywords?.join(' ')]
                        .filter(Boolean)
                        .join(' ')}
                      className="command-item"
                      onSelect={() => void runCommand(command)}
                    >
                      {command.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null,
            )}
          </Command.List>
        </Command>
      </div>
    </div>,
    document.body,
  )
}
