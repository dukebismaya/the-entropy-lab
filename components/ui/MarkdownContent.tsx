import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content?: string | null;
  className?: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className = '' }) => {
  const trimmed = content?.trim();
  if (!trimmed) return null;

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => {
            const combinedClass = ['text-cyber-cyan hover:text-white underline decoration-dotted', props.className]
              .filter(Boolean)
              .join(' ');
            return <a {...props} className={combinedClass} target="_blank" rel="noreferrer" />;
          },
          img: ({ node, ...props }) => (
            <img {...props} className="rounded-2xl border border-white/10" alt={props.alt} />
          ),
          code: ({ inline, className: codeClassName, children, ...props }) => (
            inline ? (
              <code className={`px-1.5 py-0.5 rounded bg-white/10 text-cyber-cyan ${codeClassName ?? ''}`} {...props}>
                {children}
              </code>
            ) : (
              <pre className="rounded-2xl bg-black/50 border border-white/10 overflow-x-auto p-4 text-sm" {...props}>
                <code>{children}</code>
              </pre>
            )
          ),
        }}
      >
        {trimmed}
      </ReactMarkdown>
    </div>
  );
};
