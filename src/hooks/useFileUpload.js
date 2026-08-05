import { useCallback, useState } from "react";
import { toast } from "sonner";
import { validateMarkdownFile, readAsText } from "@/lib/validateMarkdownFile.js";

/**
 * @typedef {"idle" | "parsing" | "loaded" | "error"} UploadStatus
 * @typedef {{ status: UploadStatus, file: File | null, markdown: string,
 *             error: string | null, isDragging: boolean, isParsing: boolean,
 *             acceptFile: (f: File | null) => Promise<void>,
 *             setDragging: (b: boolean) => void, reset: () => void }} UploadState
 */

/**
 * Encapsulates the file ingestion lifecycle. Kept separate from UI so it can
 * be reused/tested independently — see SRP note in the project brief.
 * @returns {UploadState}
 */
export default function useFileUpload() {
  const [status, setStatus] = useState("idle");
  const [file, setFile] = useState(null);
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const reset = useCallback(() => {
    setStatus("idle");
    setFile(null);
    setMarkdown("");
    setError(null);
    setIsDragging(false);
  }, []);

  const acceptFile = useCallback(async (incoming) => {
    setIsDragging(false);
    if (!incoming) return;

    const result = validateMarkdownFile(incoming);
    if (!result.ok) {
      setStatus("error");
      setError(result.reason);
      setFile(null);
      setMarkdown("");
      toast.error("Can't open that file", { description: result.reason });
      return;
    }

    setStatus("parsing");
    setError(null);
    setFile(incoming);
    try {
      const text = await readAsText(incoming);
      // Strip a UTF-8 BOM if present, normalize CRLF -> LF to keep the
      // markdown parser deterministic across OSes.
      const cleaned = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
      setMarkdown(cleaned);
      setStatus("loaded");
    } catch (err) {
      console.error(err);
      const reason = err?.message ?? "Couldn't read that file.";
      setStatus("error");
      setError(reason);
      setFile(null);
      setMarkdown("");
      toast.error("Read failed", { description: reason });
    }
  }, []);

  const loadSample = useCallback(() => {
    const sampleText = `# GitHub-Flavored Markdown Demo

A precise, offline viewer for GFM documents.

## Features Checklist

- [x] Full GitHub-Flavored Markdown support
- [x] Syntax highlighting for code blocks
- [x] Rich-text multi-format clipboard export
- [ ] Offline local processing only

## Sample Table

| Feature | GFM Spec | Supported |
| :--- | :---: | :---: |
| Tables | Yes | ✅ |
| Task Lists | Yes | ✅ |
| Strikethrough | Yes | ✅ |

## Code Example

\`\`\`javascript
// Quick copy button on every block!
function renderMarkdown(input) {
  return <MarkdownRenderer markdown={input} />;
}
\`\`\`

> **Note:** Copies to Word, Google Docs, Slack, and Notion with formatting intact.
`;

    setStatus("loaded");
    setFile({ name: "sample-gfm-demo.md", size: sampleText.length });
    setMarkdown(sampleText);
    setError(null);
    setIsDragging(false);
    toast.success("Loaded sample document");
  }, []);

  return {
    status,
    file,
    markdown,
    error,
    isDragging,
    isParsing: status === "parsing",
    acceptFile,
    loadSample,
    setDragging: setIsDragging,
    reset,
  };
}
