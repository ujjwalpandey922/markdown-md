/**
 * Pure functions that convert the rendered markdown viewport into a
 * self-contained multi-format clipboard payload.
 *
 * Contract:
 *   buildClipboardPayload({ element, markdown }) -> { html, plainText, markdown }
 *
 * The HTML output *inlines* the styles Word / Google Docs / Slack / Notion
 * understand (semantic tags + inline color/font on <pre> for code blocks) so
 * the rich paste travels with the payload — no external stylesheet needed.
 */

const INLINE_STYLE = {
  body: "font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; color: #111827; line-height: 1.6; font-size: 15px;",
  h1: "font-family: 'Work Sans', Helvetica, Arial, sans-serif; font-size: 28px; font-weight: 700; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb;",
  h2: "font-family: 'Work Sans', Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 700; margin: 20px 0 10px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb;",
  h3: "font-family: 'Work Sans', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 600; margin: 18px 0 8px;",
  h4: "font-family: 'Work Sans', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 600; margin: 16px 0 6px;",
  p: "margin: 0 0 12px;",
  ul: "margin: 0 0 12px; padding-left: 24px;",
  ol: "margin: 0 0 12px; padding-left: 24px;",
  li: "margin: 4px 0;",
  blockquote:
    "margin: 0 0 12px; padding: 6px 14px; border-left: 4px solid #002FA7; color: #4B5563; background: #F3F4F6;",
  code: "font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; background: #F3F4F6; padding: 2px 5px; border: 1px solid #E5E7EB; border-radius: 3px;",
  pre: "font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; background: #F9FAFB; color: #111827; border: 1px solid #E5E7EB; border-radius: 6px; padding: 12px 14px; margin: 0 0 12px; white-space: pre-wrap; word-break: break-word;",
  table:
    "border-collapse: collapse; width: 100%; margin: 0 0 12px; font-size: 14px;",
  th: "border: 1px solid #E5E7EB; padding: 6px 10px; background: #F3F4F6; text-align: left; font-weight: 600;",
  td: "border: 1px solid #E5E7EB; padding: 6px 10px; vertical-align: top;",
  hr: "border: 0; border-top: 1px solid #E5E7EB; margin: 20px 0;",
  a: "color: #002FA7; text-decoration: underline;",
};

/**
 * Walk the rendered DOM subtree and produce clean, inlined HTML.
 * We don't just outerHTML the element because that pulls in Tailwind
 * classes / data-testids that don't help clipboard consumers.
 */
function serializeElement(root) {
  const out = [];

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out.push(escapeHtml(node.nodeValue));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = node.tagName.toLowerCase();

    // Skip our per-code-block "copy" toolbar chrome from CodeBlock.jsx.
    if (
      tag === "button" ||
      (node.getAttribute("data-testid") === "code-lang" && node.parentElement?.tagName === "DIV")
    ) {
      return;
    }
    // The CodeBlock wrapper renders: <div><div>lang/copy</div><pre>...</pre></div>
    // We want just the <pre>, so detect the lang bar and drop it.
    if (
      tag === "div" &&
      node.firstElementChild &&
      node.firstElementChild.querySelector?.("[data-testid='code-lang']")
    ) {
      // Serialize only the <pre> descendants inside.
      const pre = node.querySelector("pre");
      if (pre) {
        const codeText = pre.innerText;
        out.push(`<pre style="${INLINE_STYLE.pre}"><code>${escapeHtml(codeText)}</code></pre>`);
      }
      return;
    }

    switch (tag) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        out.push(`<${tag} style="${INLINE_STYLE[tag] || INLINE_STYLE.h4}">`);
        node.childNodes.forEach(walk);
        out.push(`</${tag}>`);
        return;
      case "p":
        out.push(`<p style="${INLINE_STYLE.p}">`);
        node.childNodes.forEach(walk);
        out.push(`</p>`);
        return;
      case "ul":
        out.push(`<ul style="${INLINE_STYLE.ul}">`);
        node.childNodes.forEach(walk);
        out.push(`</ul>`);
        return;
      case "ol": {
        const start = node.getAttribute("start");
        out.push(
          `<ol style="${INLINE_STYLE.ol}"${start ? ` start="${escapeAttr(start)}"` : ""}>`,
        );
        node.childNodes.forEach(walk);
        out.push(`</ol>`);
        return;
      }
      case "li": {
        const isTask = (node.className || "").includes("task-list-item");
        out.push(`<li style="${INLINE_STYLE.li}${isTask ? "; list-style: none;" : ""}">`);
        node.childNodes.forEach(walk);
        out.push(`</li>`);
        return;
      }
      case "blockquote":
        out.push(`<blockquote style="${INLINE_STYLE.blockquote}">`);
        node.childNodes.forEach(walk);
        out.push(`</blockquote>`);
        return;
      case "code":
        if (node.parentElement?.tagName === "PRE") {
          node.childNodes.forEach(walk);
        } else {
          out.push(`<code style="${INLINE_STYLE.code}">`);
          node.childNodes.forEach(walk);
          out.push(`</code>`);
        }
        return;
      case "pre":
        out.push(`<pre style="${INLINE_STYLE.pre}"><code>`);
        out.push(escapeHtml(node.innerText));
        out.push(`</code></pre>`);
        return;
      case "table":
        out.push(`<table style="${INLINE_STYLE.table}">`);
        node.childNodes.forEach(walk);
        out.push(`</table>`);
        return;
      case "thead":
      case "tbody":
      case "tr":
        out.push(`<${tag}>`);
        node.childNodes.forEach(walk);
        out.push(`</${tag}>`);
        return;
      case "th": {
        const align = node.style?.textAlign;
        out.push(
          `<th style="${INLINE_STYLE.th}${align ? `; text-align: ${align}` : ""}">`,
        );
        node.childNodes.forEach(walk);
        out.push(`</th>`);
        return;
      }
      case "td": {
        const align = node.style?.textAlign;
        out.push(
          `<td style="${INLINE_STYLE.td}${align ? `; text-align: ${align}` : ""}">`,
        );
        node.childNodes.forEach(walk);
        out.push(`</td>`);
        return;
      }
      case "hr":
        out.push(`<hr style="${INLINE_STYLE.hr}" />`);
        return;
      case "a": {
        const href = node.getAttribute("href") || "#";
        out.push(`<a href="${escapeAttr(href)}" style="${INLINE_STYLE.a}">`);
        node.childNodes.forEach(walk);
        out.push(`</a>`);
        return;
      }
      case "img": {
        const src = node.getAttribute("src") || "";
        const alt = node.getAttribute("alt") || "";
        out.push(
          `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" style="max-width: 100%; height: auto;" />`,
        );
        return;
      }
      case "strong":
      case "b":
        out.push(`<strong>`);
        node.childNodes.forEach(walk);
        out.push(`</strong>`);
        return;
      case "em":
      case "i":
        out.push(`<em>`);
        node.childNodes.forEach(walk);
        out.push(`</em>`);
        return;
      case "del":
      case "s":
      case "strike":
        out.push(`<s>`);
        node.childNodes.forEach(walk);
        out.push(`</s>`);
        return;
      case "input": {
        const type = node.getAttribute("type");
        if (type === "checkbox") {
          const checked = node.checked ? " checked" : "";
          out.push(
            `<span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #4B5563; margin-right: 6px; vertical-align: middle; text-align: center; line-height: 12px; font-size: 12px;">${node.checked ? "✓" : ""}</span>`,
          );
          // include a hidden attr for consumers that understand it
          if (checked) out.push("");
        }
        return;
      }
      case "br":
        out.push(`<br />`);
        return;
      case "span":
      case "sub":
      case "sup":
      case "mark":
      case "kbd":
        out.push(`<${tag}>`);
        node.childNodes.forEach(walk);
        out.push(`</${tag}>`);
        return;
      case "div":
      case "article":
      case "section":
        // Transparent container — just recurse.
        node.childNodes.forEach(walk);
        return;
      default:
        // Unknown tag → recurse into children only, drop the wrapper.
        node.childNodes.forEach(walk);
        return;
    }
  };

  root.childNodes.forEach(walk);
  return out.join("");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/**
 * Best-effort markdown → readable plain text.
 * We strip markdown syntax markers so plain-text targets get clean text,
 * not raw markdown source (which we already ship separately in text/markdown).
 */
export function markdownToPlainText(markdown) {
  return markdown
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // headings
    .replace(/^\s{0,3}>\s?/gm, "") // blockquotes
    .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, "• ") // task list
    .replace(/^\s*[-*+]\s+/gm, "• ") // unordered list
    .replace(/^\s*\d+\.\s+/gm, "") // ordered list markers
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```[a-z]*\n?/gi, "").replace(/```/g, ""))
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1$2") // italic
    .replace(/(^|[^_])_([^_\n]+)_/g, "$1$2")
    .replace(/~~([^~]+)~~/g, "$1") // strike
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // images → alt
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)") // links
    .replace(/^[-*_]{3,}\s*$/gm, "────────────────") // hr
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * @param {{ element: HTMLElement, markdown: string }} args
 * @returns {{ html: string, plainText: string, markdown: string }}
 */
export function buildClipboardPayload({ element, markdown }) {
  const body = serializeElement(element);
  const html = `<!doctype html><html><body style="${INLINE_STYLE.body}">${body}</body></html>`;
  const plainText = markdownToPlainText(markdown);
  return { html, plainText, markdown };
}

export function isClipboardItemSupported() {
  return (
    typeof window !== "undefined" &&
    typeof window.ClipboardItem !== "undefined" &&
    !!navigator.clipboard?.write
  );
}
