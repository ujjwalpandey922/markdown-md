import { useMemo } from "react";
import { buildClipboardPayload, isClipboardItemSupported } from "@/lib/markdownToClipboard.js";

/**
 * Thin hook wrapping the pure clipboard-serialization module. Depends on an
 * abstract "renderable content" shape ({ element, markdown }) so it stays
 * testable without a real DOM clipboard (see brief: dependency inversion).
 */
export default function useClipboardExport() {
  return useMemo(() => {
    const isSupported = isClipboardItemSupported();

    async function copy({ element, markdown }) {
      const payload = buildClipboardPayload({ element, markdown });
      // 1) Best path: multi-format ClipboardItem.
      if (isSupported) {
        try {
          const items = {
            "text/html": new Blob([payload.html], { type: "text/html" }),
            "text/plain": new Blob([payload.plainText], { type: "text/plain" }),
          };
          const item = new window.ClipboardItem(items);
          await navigator.clipboard.write([item]);
          return { mode: "multi" };
        } catch (err) {
          // Fall through to next strategy.
          console.warn("[clipboard] ClipboardItem failed, falling back", err);
        }
      }
      // 2) Rich-text-only via navigator.clipboard.write single item.
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(payload.plainText);
          return { mode: "text" };
        } catch (err) {
          console.warn("[clipboard] writeText failed", err);
        }
      }
      // 3) execCommand legacy fallback.
      const ok = legacyCopy(payload.plainText);
      if (ok) return { mode: "text" };
      throw new Error("Clipboard access was denied.");
    }

    return { copy, isSupported };
  }, []);
}

function legacyCopy(text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
