/**
 * File-ingestion validation + reading utilities.
 * Pure functions — no React, no DOM state — so they are trivially testable.
 */

/** Hard ceiling. 5 MB of raw markdown text is already an enormous doc. */
export const MAX_BYTES = 5 * 1024 * 1024;

const TEXT_MIME_ALLOW = [
  "text/markdown",
  "text/x-markdown",
  "text/plain",
  "text/x-web-markdown",
  "application/markdown",
  "application/octet-stream", // some OSes report .md as octet-stream
  "",
];

const EXT_ALLOW = new Set(["md", "markdown", "mdown", "mkd", "mkdn", "txt"]);

function getExt(name) {
  const i = name.lastIndexOf(".");
  if (i < 0) return "";
  return name.slice(i + 1).toLowerCase();
}

/**
 * @param {File} file
 * @returns {{ok: true} | {ok: false, reason: string}}
 */
export function validateMarkdownFile(file) {
  if (!file) return { ok: false, reason: "No file was provided." };

  if (file.size === 0) {
    return { ok: false, reason: "That file is empty — nothing to render." };
  }

  if (file.size > MAX_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      reason: `File is ${mb} MB. The limit is 5 MB so the browser stays responsive.`,
    };
  }

  const ext = getExt(file.name);
  const mime = (file.type || "").toLowerCase();

  const extOk = EXT_ALLOW.has(ext);
  const mimeOk = TEXT_MIME_ALLOW.includes(mime) || mime.startsWith("text/");

  // Accept if either the extension is markdown-ish OR the MIME says text/*.
  // This handles both "no extension but text/markdown" and ".md but wrong MIME"
  // as called out in the brief.
  if (!extOk && !mimeOk) {
    return {
      ok: false,
      reason: `That looks like a "${mime || ext || "binary"}" file. Please upload a .md, .markdown, or .txt file.`,
    };
  }

  return { ok: true };
}

/**
 * Reads the file as UTF-8 text. Wraps FileReader in a promise.
 * @param {File} file
 * @returns {Promise<string>}
 */
export function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(new Error("The browser couldn't read that file."));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Unexpected file contents (not text)."));
        return;
      }
      // Cheap binary detection — if there are many NUL bytes it isn't text.
      const sample = result.slice(0, 4096);
      let nulls = 0;
      for (let i = 0; i < sample.length; i++) {
        if (sample.charCodeAt(i) === 0) nulls++;
      }
      if (nulls > 8) {
        reject(new Error("That looks like a binary file, not markdown."));
        return;
      }
      resolve(result);
    };
    reader.readAsText(file, "utf-8");
  });
}

/**
 * Human-readable byte size, e.g. 12.4 KB.
 * @param {number} bytes
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
