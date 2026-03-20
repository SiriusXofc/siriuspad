import { Play } from 'lucide-react'
import { isValidElement } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { useTranslation } from 'react-i18next'

interface MarkdownPreviewProps {
  content: string
  onRunCodeInTerminal?: (payload: {
    code: string
    language: string | null
  }) => void
}

function extractCodeText(children: React.ReactNode): string {
  if (
    isValidElement<{ children?: React.ReactNode }>(children)
  ) {
    const content = children.props.children
    return Array.isArray(content) ? content.join('') : `${content ?? ''}`
  }

  if (Array.isArray(children)) {
    return children.map((child) => `${child ?? ''}`).join('')
  }

  return `${children ?? ''}`
}

function extractCodeLanguage(children: React.ReactNode): string | null {
  const resolveFromClassName = (className?: string) => {
    const match = className?.match(/language-([a-z0-9#+-]+)/i)
    return match?.[1] ?? null
  }

  if (isValidElement<{ className?: string; children?: React.ReactNode }>(children)) {
    return resolveFromClassName(children.props.className)
  }

  if (Array.isArray(children)) {
    for (const child of children) {
      if (
        isValidElement<{ className?: string }>(child) &&
        child.props.className
      ) {
        return resolveFromClassName(child.props.className)
      }
    }
  }

  return null
}

export function MarkdownPreview({
  content,
  onRunCodeInTerminal,
}: MarkdownPreviewProps) {
  const { t } = useTranslation()

  return (
    <div className="h-full overflow-y-auto bg-[#111111] px-6 py-5">
      <div className="max-w-none text-[13px] leading-7 text-text-primary">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1(props) {
              return <h1 {...props} className="mb-4 text-3xl font-semibold" />
            },
            h2(props) {
              return <h2 {...props} className="mb-3 mt-8 text-2xl font-semibold" />
            },
            h3(props) {
              return <h3 {...props} className="mb-3 mt-6 text-xl font-semibold" />
            },
            p(props) {
              return <p {...props} className="mb-4 text-text-primary" />
            },
            ul(props) {
              return <ul {...props} className="mb-4 list-disc pl-6" />
            },
            ol(props) {
              return <ol {...props} className="mb-4 list-decimal pl-6" />
            },
            li(props) {
              return <li {...props} className="mb-1" />
            },
            code(props) {
              return (
                <code
                  {...props}
                  className={`${props.className ?? ''} rounded-md bg-[#161616] px-1.5 py-0.5 text-[0.9em]`}
                />
              )
            },
            pre(props) {
              const code = extractCodeText(props.children).trimEnd()
              const language = extractCodeLanguage(props.children)

              return (
                <div className="relative mb-4 overflow-hidden rounded-lg border border-border bg-[#0f0f0f]">
                  {onRunCodeInTerminal && code ? (
                    <button
                      type="button"
                      className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-border bg-[#161616] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-text-secondary transition hover:border-focus hover:bg-hover hover:text-text-primary"
                      onClick={() =>
                        onRunCodeInTerminal({
                          code,
                          language,
                        })
                      }
                    >
                      <Play className="h-3 w-3" />
                      {t('terminal.run')}
                    </button>
                  ) : null}
                  <pre
                    {...props}
                    className="overflow-x-auto p-4 pr-24 text-xs"
                  />
                </div>
              )
            },
            blockquote(props) {
              return (
                <blockquote
                  {...props}
                  className="mb-4 border-l-2 border-accent pl-4 text-text-secondary"
                />
              )
            },
            table(props) {
              return (
                <div className="overflow-x-auto">
                  <table
                    {...props}
                    className="min-w-full border-collapse rounded-lg border border-border"
                  />
                </div>
              )
            },
            th(props) {
              return (
                <th
                  {...props}
                  className="border-b border-border bg-[#161616] px-3 py-2 text-left font-medium"
                />
              )
            },
            td(props) {
              return <td {...props} className="border-b border-border px-3 py-2" />
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
