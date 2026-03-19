import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PriorityDot } from '@/components/ui/PriorityDot'
import { TagPill } from '@/components/ui/TagPill'

interface OnboardingModalProps {
  onComplete: () => void
}

const STEPS = [
  {
    id: 'welcome',
    icon: '◆',
    title: 'Bem-vindo ao SiriusPad',
    description:
      'Um bloco de notas feito para devs. Markdown, terminal embutido, tags, prioridades e tudo no lugar certo.',
    visual: 'welcome',
  },
  {
    id: 'notes',
    icon: '≡',
    title: 'Crie notas de tudo',
    description:
      'Ctrl+N para nova nota. Cada nota tem título, conteúdo em Markdown, tags e prioridade. Use para bugs, ideias, comandos e rascunhos rápidos.',
    visual: 'notes',
  },
  {
    id: 'tags',
    icon: '#',
    title: 'Tags e prioridades',
    description:
      'Tags como bug, urgente, feat e idea ganham cor automática. A prioridade ajuda a bater o olho no que precisa de atenção primeiro.',
    visual: 'tags',
  },
  {
    id: 'terminal',
    icon: '>_',
    title: 'Terminal embutido',
    description:
      'Ctrl+` para abrir o terminal. Blocos de código nas notas podem ser enviados direto para execução sem sair da tela.',
    visual: 'terminal',
  },
  {
    id: 'shortcuts',
    icon: '⌨',
    title: 'Atalhos essenciais',
    description: '',
    visual: 'shortcuts',
    shortcuts: [
      { key: 'Ctrl+N', label: 'Nova nota' },
      { key: 'Ctrl+S', label: 'Salvar' },
      { key: 'Ctrl+K', label: 'Paleta de comandos' },
      { key: 'Ctrl+F', label: 'Buscar notas' },
      { key: 'Ctrl+`', label: 'Toggle terminal' },
      { key: 'Ctrl+Enter', label: 'Rodar snippet' },
    ],
  },
  {
    id: 'ready',
    icon: '✓',
    title: 'Pronto para usar',
    description:
      'Você pode revisitar esse tutorial a qualquer momento em Configurações. Bora começar.',
    visual: 'ready',
  },
] as const

function StepVisual({ step }: { step: (typeof STEPS)[number] }) {
  switch (step.visual) {
    case 'notes':
      return (
        <div className="rounded-lg border border-border bg-[#0f0f0f] p-3">
          <div className="mb-2 text-xs text-text-secondary">bug de layout</div>
          <div className="text-sm text-text-primary">Handles de resize cobrindo a titlebar</div>
        </div>
      )
    case 'tags':
      return (
        <div className="flex flex-wrap gap-2">
          <TagPill tag="bug" />
          <TagPill tag="urgente" />
          <TagPill tag="feat" />
          <TagPill tag="idea" />
          <PriorityDot priority="urgente" label="Urgente" />
        </div>
      )
    case 'terminal':
      return (
        <div className="rounded-lg border border-border bg-[#0f0f0f] p-3 font-mono text-xs">
          <div className="text-text-secondary">~/projeto $ npm run dev</div>
          <div className="mt-2 text-[#34d399]">VITE ready in 412ms</div>
        </div>
      )
    case 'shortcuts':
      return (
        <div className="grid gap-2 rounded-lg border border-border bg-[#0f0f0f] p-3 text-xs">
          {step.shortcuts?.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-text-primary">{shortcut.key}</span>
              <span className="text-text-secondary">{shortcut.label}</span>
            </div>
          ))}
        </div>
      )
    default:
      return (
        <div className="rounded-lg border border-border bg-[#0f0f0f] p-3 text-sm text-text-secondary">
          SiriusPad pronto para fluxo rápido, escuro e direto ao ponto.
        </div>
      )
  }
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const step = useMemo(() => STEPS[index], [index])
  const isLast = index === STEPS.length - 1

  return (
    <div className="absolute inset-0 z-[90] flex items-center justify-center bg-black/85 px-4 py-8">
      <div className="w-full max-w-[480px] rounded-[12px] border border-[#2d2060] bg-[#111111]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-[#161616] text-sm text-text-primary">
              {step.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary">{step.title}</p>
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
          {step.description ? (
            <p className="mb-4 text-sm leading-7 text-text-secondary">
              {step.description}
            </p>
          ) : null}

          <StepVisual step={step} />

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
