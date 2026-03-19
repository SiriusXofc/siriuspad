import { X } from 'lucide-react'

import { getTagPalette } from '@/lib/tagColor'

interface TagPillProps {
  tag: string
  active?: boolean
  compact?: boolean
  onClick?: () => void
  onRemove?: () => void
}

export function TagPill({
  tag,
  active = false,
  compact = false,
  onClick,
  onRemove,
}: TagPillProps) {
  const palette = getTagPalette(tag)
  const Component = onClick ? 'button' : 'span'

  return (
    <Component
      type={Component === 'button' ? 'button' : undefined}
      className={`inline-flex items-center gap-1 rounded-full border font-medium transition ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
      } ${active ? 'ring-1 ring-[var(--accent)]' : ''}`}
      style={{
        backgroundColor: palette.bg,
        borderColor: palette.border,
        color: palette.color,
      }}
      onClick={onClick}
      title={tag}
    >
      <span className="truncate">{tag}</span>
      {onRemove ? (
        <button
          type="button"
          className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current/20 bg-transparent p-0 opacity-80 transition hover:opacity-100"
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          aria-label={`Remover tag ${tag}`}
        >
          <X className="h-2.5 w-2.5" />
        </button>
      ) : null}
    </Component>
  )
}
