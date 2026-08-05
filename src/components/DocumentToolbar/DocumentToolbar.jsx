import { useState } from "react";
import { Check, ClipboardCopy, FileText, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import useClipboardExport from "@/hooks/useClipboardExport.js";
import { formatBytes } from "@/lib/validateMarkdownFile.js";

/**
 * Toolbar for a loaded document. Shows filename + metadata, and offers the
 * primary "Copy" (multi-format) action + a "New file" reset.
 */
export default function DocumentToolbar({ file, markdown, onClear }) {
  const [copied, setCopied] = useState(false);
  const { copy, isSupported } = useClipboardExport();

  const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const readMin = Math.max(1, Math.round(words / 220));

  const handleCopy = async () => {
    const targetEl = document.getElementById("markdown-output");
    if (!targetEl) return;

    try {
      const result = await copy({ element: targetEl, markdown });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard", {
        description:
          result.mode === "multi"
            ? "HTML, plain text and markdown are on the clipboard."
            : result.mode === "html"
              ? "Rich text copied (single-format fallback)."
              : "Plain text copied (rich formats unavailable).",
      });
    } catch (err) {
      console.error(err);
      toast.error("Couldn't copy", {
        description:
          err?.message ??
          "Clipboard access was blocked. Grant permission and try again.",
      });
    }
  };

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3"
      data-testid="document-toolbar"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-border bg-muted text-muted-foreground">
          <FileText size={16} />
        </span>
        <div className="min-w-0">
          <p
            className="truncate font-[IBM_Plex_Mono] text-sm font-medium"
            data-testid="doc-filename"
            title={file?.name}
          >
            {file?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(file?.size ?? 0)} · {words.toLocaleString()} words ·{" "}
            {readMin} min read
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isSupported ? (
          <span
            className="hidden items-center gap-1 rounded-full border border-border bg-muted px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:inline-flex"
            title="Multi-format clipboard unavailable in this browser."
          >
            <AlertTriangle size={11} /> fallback mode
          </span>
        ) : null}
        <button
          type="button"
          onClick={handleCopy}
          data-testid="copy-btn"
          className="inline-flex h-9 items-center gap-2 rounded-full bg-accent px-4 text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground transition-colors hover:brightness-110 active:scale-[.98]"
        >
          {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
          {copied ? "Copied" : "Copy Document"}
        </button>
        <button
          type="button"
          onClick={onClear}
          data-testid="clear-file-btn"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-transparent px-3 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Clear file and upload a new one"
        >
          <X size={14} /> New
        </button>
      </div>

      <div
        aria-live="polite"
        role="status"
        className="sr-only"
        data-testid="copy-status-live"
      >
        {copied ? "Document copied to clipboard" : ""}
      </div>
    </div>
  );
}
