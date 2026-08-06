import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import CodeBlock from "@/components/MarkdownRenderer/renderers/CodeBlock.jsx";
import MdLink from "@/components/MarkdownRenderer/renderers/MdLink.jsx";
import MdImage from "@/components/MarkdownRenderer/renderers/MdImage.jsx";
import MdBlockquote from "@/components/MarkdownRenderer/renderers/MdBlockquote.jsx";

/**
 * Sanitize schema. We *do* allow embedded HTML (GFM permits it), but strip
 * anything script-y / event-handler-y. This keeps XSS-safe copy of untrusted
 * uploaded markdown, per the brief's explicit decision request.
 */
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "kbd",
    "sub",
    "sup",
    "details",
    "summary",
    "mark",
    "div",
    "span",
  ],
  attributes: {
    ...defaultSchema.attributes,
    // Allow className on code, span, div so syntax highlighting and math classes survive.
    code: [...(defaultSchema.attributes?.code || []), "className", "class"],
    span: [...(defaultSchema.attributes?.span || []), "className", "class"],
    div: [...(defaultSchema.attributes?.div || []), "className", "class"],
    input: [
      ...(defaultSchema.attributes?.input || []),
      "checked",
      "disabled",
      "type",
    ],
    "*": [
      ...(defaultSchema.attributes?.["*"] || []),
      // Explicitly *don't* allow on*/style attributes.
      "id",
      "className",
      "class",
    ],
  },
};

/**
 * The rendered viewport. Kept dumb — takes a markdown string and produces DOM.
 * Wrapped by an ErrorBoundary at the caller so parser explosions can't blank
 * the app.
 */
export default function MarkdownRenderer({ markdown }) {
  // Wrapping id lets the toolbar reach into a stable node when serializing
  // to HTML for the multi-format clipboard payload.
  const components = useMemo(
    () => ({
      code: CodeBlock,
      a: MdLink,
      img: MdImage,
      blockquote: MdBlockquote,
      // task list items get a data-testid via GFM plugin's default className
      li: ({ node, className, children, ...rest }) => {
        const isTask = (className || "").includes("task-list-item");
        return (
          <li
            className={
              isTask
                ? `task-list-item ${className || ""}`
                : className || undefined
            }
            {...rest}
          >
            {children}
          </li>
        );
      },
    }),
    [],
  );

  return (
    <article
      id="markdown-output"
      data-testid="markdown-output"
      className="md-body md-fade-in md-scroll mt-6"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, sanitizeSchema],
          [rehypeKatex, { throwOnError: false }],
        ]}
        components={components}
        skipHtml={false}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
