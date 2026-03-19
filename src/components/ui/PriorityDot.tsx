import type { NotePriority } from '@/types'

const PRIORITY_COLORS: Record<NotePriority, string> = {
  urgente: 'var(--priority-urgent)',
  alta: 'var(--priority-high)',
  media: 'var(--priority-medium)',
  baixa: 'var(--priority-low)',
}

interface PriorityDotProps {
  priority?: NotePriority
  label?: string
}

export function PriorityDot({
  priority = 'media',
  label,
}: PriorityDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: PRIORITY_COLORS[priority] }}
      />
      {label ? (
        <span className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">
          {label}
        </span>
      ) : null}
    </span>
  )
}
