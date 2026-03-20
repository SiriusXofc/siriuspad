import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PriorityDot } from '@/components/ui/PriorityDot'
import { TagPill } from '@/components/ui/TagPill'

interface OnboardingModalProps {
  onComplete: () => void
}

const STEPS = [
  { id: 'welcome', icon: '◆', visual: 'welcome' },
  { id: 'notes', icon: '≡', visual: 'notes' },
  { id: 'tags', icon: '#', visual: 'tags' },
  { id: 'terminal', icon: '>_', visual: 'terminal' },
  { id: 'command', icon: '⌘', visual: 'command' },
  { id: 'shortcuts', icon: '⌨', visual: 'shortcuts' },
  { id: 'ready', icon: '✓', visual: 'ready' },
] as const

function StepVisual({
  step,
  shortcuts,
}: {
  step: (typeof STEPS)[number]
  shortcuts: Array<{ key: string; label: string }>
}) {
  const { t } = useTranslation()

  switch (step.visual) {
    case 'notes':
      return (
        <div className="grid gap-3 rounded-lg border border-border bg-[#0f0f0f] p-4">
          <div className="rounded-md border border-border bg-[#111111] p-3">
            <div className="mb-1 text-xs text-text-secondary">
              {t('onboarding.visuals.notesTitle')}
            </div>
            <div className="text-sm text-text-primary">
              {t('onboarding.visuals.notesBody')}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <TagPill tag="bug" compact />
            <TagPill tag="deploy" compact />
            <TagPill tag="api" compact />
          </div>
        </div>
      )
    case 'tags':
      return (
        <div className="grid gap-3 rounded-lg border border-border bg-[#0f0f0f] p-4">
          <div className="flex flex-wrap gap-2">
            <TagPill tag="bug" />
            <TagPill tag="urgente" />
            <TagPill tag="feat" />
            <TagPill tag="idea" />
          </div>
          <div className="flex flex-wrap gap-2">
            <PriorityDot priority="urgente" label={t('priority.urgente')} />
            <PriorityDot priority="alta" label={t('priority.alta')} />
            <PriorityDot priority="media" label={t('priority.media')} />
          </div>
        </div>
      )
    case 'terminal':
      return (
        <div className="grid gap-3 rounded-lg border border-border bg-[#0f0f0f] p-4 font-mono text-xs">
          <div className="rounded-md border border-border bg-[#111111] p-3">
            <div className="text-text-secondary">~/project $ npm run dev</div>
            <div className="mt-2 text-[#34d399]">VITE ready in 412ms</div>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-md border border-border bg-[#111111] px-2 py-1 text-text-secondary">
              Ctrl+`
            </span>
            <span className="rounded-md border border-border bg-[#111111] px-2 py-1 text-text-secondary">
              Enter
            </span>
            <span className="rounded-md border border-border bg-[#111111] px-2 py-1 text-text-secondary">
              Ctrl+C
            </span>
          </div>
        </div>
      )
    case 'command':
      return (
        <div className="grid gap-2 rounded-lg border border-border bg-[#0f0f0f] p-4 text-xs">
          {[
            {
              label: t('commands.newNote'),
              shortcut: 'Ctrl+N',
            },
            {
              label: t('commands.findReplace'),
              shortcut: 'Ctrl+H',
            },
            {
              label: t('commands.zoomIn'),
              shortcut: 'Ctrl++',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-[#111111] px-3 py-2"
            >
              <span className="text-text-primary">{item.label}</span>
              <span className="rounded-md border border-border bg-[#161616] px-2 py-1 text-[11px] text-text-secondary">
                {item.shortcut}
              </span>
            </div>
          ))}
        </div>
      )
    case 'shortcuts':
      return (
        <div className="grid gap-2 rounded-lg border border-border bg-[#0f0f0f] p-4 text-xs">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-[#111111] px-3 py-2"
            >
              <span className="text-text-primary">{shortcut.key}</span>
              <span className="text-text-secondary">{shortcut.label}</span>
            </div>
          ))}
        </div>
      )
    case 'welcome':
      return (
        <div className="grid gap-3 rounded-lg border border-border bg-[#0f0f0f] p-4 text-sm text-text-secondary">
          <div className="rounded-md border border-[#2d2060] bg-[rgba(124,58,237,0.12)] px-3 py-3 text-text-primary">
            {t('onboarding.visuals.welcomeBadge')}
          </div>
          <div className="grid gap-2 text-xs">
            <div>{t('onboarding.visuals.welcomePoint1')}</div>
            <div>{t('onboarding.visuals.welcomePoint2')}</div>
            <div>{t('onboarding.visuals.welcomePoint3')}</div>
          </div>
        </div>
      )
    default:
      return (
        <div className="grid gap-3 rounded-lg border border-border bg-[#0f0f0f] p-4 text-sm text-text-secondary">
          <div className="rounded-md border border-[#2d2060] bg-[rgba(124,58,237,0.12)] px-3 py-3 text-text-primary">
            {t('onboarding.visuals.readyBadge')}
          </div>
          <div>{t('onboarding.visuals.readyHint')}</div>
        </div>
      )
  }
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const step = useMemo(() => STEPS[index], [index])
  const isLast = index === STEPS.length - 1
  const shortcuts = useMemo(
    () => [
      { key: 'Ctrl+N', label: t('commands.newNote') },
      { key: 'Ctrl+S', label: t('common.save') },
      { key: 'Ctrl+K', label: t('commands.commandPalette') },
      { key: 'Ctrl+F', label: t('titlebar.search') },
      { key: 'Ctrl+`', label: t('terminal.toggleTitle') },
      { key: 'Ctrl+Enter', label: t('terminal.run') },
    ],
    [t],
  )

  return (
    <div className="absolute inset-0 z-[90] flex items-center justify-center bg-black/85 px-4 py-8">
      <div className="w-full max-w-[540px] rounded-[12px] border border-[#2d2060] bg-[#111111]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-[#161616] text-sm text-text-primary">
              {step.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {t(`onboarding.steps.${step.id}.title`)}
              </p>
              <p className="text-xs text-text-secondary">
                {index + 1} / {STEPS.length}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="text-xs text-text-secondary transition hover:text-text-primary"
            onClick={onComplete}
          >
            {t('onboarding.skip')}
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="mb-4 text-sm leading-7 text-text-secondary">
            {t(`onboarding.steps.${step.id}.description`)}
          </p>

          <StepVisual step={step} shortcuts={shortcuts} />

          <div className="mt-5 flex items-center justify-center gap-2">
            {STEPS.map((item, dotIndex) => (
              <span
                key={item.id}
                className={`h-2 w-2 rounded-full ${
                  dotIndex === index ? 'bg-accent' : 'bg-[#2a2a2a]'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <button
            type="button"
            className="rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary disabled:opacity-40"
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            disabled={index === 0}
          >
            {t('onboarding.prev')}
          </button>

          {isLast ? (
            <button
              type="button"
              className="rounded-md border border-border bg-[#161616] px-3 py-2 text-sm text-text-primary transition hover:border-focus hover:bg-hover"
              onClick={onComplete}
            >
              {t('onboarding.start')}
            </button>
          ) : (
            <button
              type="button"
              className="rounded-md border border-border bg-[#161616] px-3 py-2 text-sm text-text-primary transition hover:border-focus hover:bg-hover"
              onClick={() =>
                setIndex((current) => Math.min(STEPS.length - 1, current + 1))
              }
            >
              {t('onboarding.next')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
