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

  return {
    status,
    file,
    markdown,
    error,
    isDragging,
    isParsing: status === "parsing",
    acceptFile,
    setDragging: setIsDragging,
    reset,
  };
}
