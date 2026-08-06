import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 * Custom renderer for `code` nodes. react-markdown passes:
 *   - inline: true for `foo` spans (removed in v9 — we detect from className)
 *   - className: "language-xyz" for fenced blocks
 * We render inline code with a subtle chip and fenced blocks with
 * PrismJS highlighting via react-syntax-highlighter.
 */
export default function CodeBlock({
  node,
  inline,
  className,
  children,
  ...rest
}) {
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true,
  );

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const match = /language-(\w+)/.exec(className || "");
  const isFenced =
    !inline &&
    (match ||
      String(children).includes("\n") ||
      node?.position?.start?.line !== node?.position?.end?.line);

  if (!isFenced) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  }

  const language = match ? match[1] : "text";
  const raw = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — silent, main copy button covers this case */
    }
  };

  return (
    <div className="group relative">
      <div className="flex items-center justify-between rounded-t-md border border-b-0 border-border bg-muted px-3 py-1.5 font-[IBM_Plex_Mono] text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span data-testid="code-lang">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          data-testid="code-copy-btn"
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          aria-label="Copy code block"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: "1rem 1.1rem",
          borderRadius: 0,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
          fontSize: "0.85em",
          background: isDark ? "#1E1E1E" : "#F9FAFB",
        }}
        codeTagProps={{
          style: { fontFamily: "JetBrains Mono, source-code-pro, monospace" },
        }}
        wrapLongLines
      >
        {raw}
      </SyntaxHighlighter>
    </div>
  );
}
