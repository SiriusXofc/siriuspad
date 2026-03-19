export const TAG_PRESETS: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  bug: {
    bg: 'var(--tag-bug-bg)',
    color: 'var(--tag-bug-color)',
    border: 'var(--tag-bug-border)',
  },
  urgente: {
    bg: 'var(--tag-urgent-bg)',
    color: 'var(--tag-urgent-color)',
    border: 'var(--tag-urgent-border)',
  },
  feat: {
    bg: 'var(--tag-feat-bg)',
    color: 'var(--tag-feat-color)',
    border: 'var(--tag-feat-border)',
  },
  idea: {
    bg: 'var(--tag-idea-bg)',
    color: 'var(--tag-idea-color)',
    border: 'var(--tag-idea-border)',
  },
  note: {
    bg: 'var(--tag-note-bg)',
    color: 'var(--tag-note-color)',
    border: 'var(--tag-note-border)',
  },
  done: {
    bg: 'var(--tag-done-bg)',
    color: 'var(--tag-done-color)',
    border: 'var(--tag-done-border)',
  },
}

function hashHue(str: string): number {
  let hash = 0

  for (let index = 0; index < str.length; index += 1) {
    hash = str.charCodeAt(index) + ((hash << 5) - hash)
  }

  return Math.abs(hash) % 360
}

export function hashColor(str: string): string {
  return `hsl(${hashHue(str)}, 60%, 65%)`
}

export function getTagPalette(tag: string) {
  const normalized = tag.trim().toLowerCase()
  const preset = TAG_PRESETS[normalized]

  if (preset) {
    return preset
  }

  const hue = hashHue(normalized || tag)

  return {
    bg: `hsla(${hue}, 45%, 18%, 0.9)`,
    color: `hsl(${hue}, 68%, 67%)`,
    border: `hsla(${hue}, 55%, 42%, 0.45)`,
  }
}
