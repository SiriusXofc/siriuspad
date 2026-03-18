import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

interface MarkdownPreviewProps {
  content: string
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="h-full overflow-y-auto bg-base px-8 py-6">
      <div className="max-w-none text-sm leading-7 text-text-primary">
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
                  className={`${props.className ?? ''} rounded bg-surface px-1.5 py-0.5 text-[0.9em]`}
                />
              )
            },
            pre(props) {
              return (
                <pre
                  {...props}
                  className="overflow-x-auto rounded-2xl border border-border bg-surface p-4 text-xs"
                />
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
                    className="min-w-full border-collapse rounded-xl border border-border"
                  />
                </div>
              )
            },
            th(props) {
              return (
                <th
                  {...props}
                  className="border-b border-border bg-surface px-3 py-2 text-left font-medium"
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
