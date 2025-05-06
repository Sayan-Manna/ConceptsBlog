"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css";

export default function MarkdownContent({ source }: { source: string }) {
  return (
    <div className="prose dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mt-8 mb-4 text-[#F5C2E7]" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-3xl font-semibold mt-6 mb-3 text-[#CBA6F7]" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-2xl font-semibold mt-4 mb-2 text-[#F7B267]" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-xl font-medium mt-4 mb-2 text-[#A6E3A1]" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 leading-7" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc ml-6 mb-4 marker:text-yellow-300" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal ml-6 mb-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 pl-4 italic text-muted-foreground" {...props} />,
          code: ({ node, inline, className, children, ...props }) => {
            return inline ? (
              <code className="bg-muted px-1 py-0.5 rounded text-sm !font-mono" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto font-mono" {...props}>
                <code className={className}>{children}</code>
              </pre>
            );
          },
          hr: ({ node, ...props }) => <hr className="my-8 border-t border-gray-400 dark:border-gray-600" {...props} />,
          br: () => <br className="my-2" />,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
