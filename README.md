# MDR — Markdown Renderer

A production-grade, client-side viewer for GitHub-Flavored Markdown. Drop a `.md`
file in, read it beautifully, and copy the result as rich text that pastes cleanly
into Word, Google Docs, Slack, or Notion. No backend, no accounts, no network calls.

## Setup

```bash
yarn install
yarn start        # dev server on http://localhost:3000
yarn build        # static production build → dist/
yarn preview      # serve the built app locally
```

The build output in `dist/` is deploy-ready for Vercel / Netlify / Cloudflare Pages —
no server runtime required.

## Key design & technical decisions

- **Vite + React 18, JavaScript only.** No TypeScript in the shipped code (JSDoc
  is used where a type hint helps).
- **Markdown pipeline:** `react-markdown` + `remark-gfm` for parsing, `rehype-raw`
  to allow embedded HTML (a real GFM feature), then `rehype-sanitize` with a
  restricted schema to strip anything script-y. Uploaded files are untrusted, so
  sanitization is on by default — inline `on*` handlers, `<script>`, and
  `style="…"` attributes never survive.
- **Syntax highlighting:** `react-syntax-highlighter` using PrismJS themes
  (`oneDark` / `oneLight`) picked from the current theme. A small copy button
  lives on each code block header — separate from the main "Copy Document"
  action.
- **Multi-format clipboard:** the primary Copy button constructs a
  `ClipboardItem` with `text/html` + `text/plain`. The HTML is a walk of the
  rendered DOM that emits *inlined* styles (semantic `<strong>`, `<em>`,
  `<table>`, `<blockquote>`, `<pre>`) so it pastes correctly into Word / Docs /
  Slack / Notion without needing an external stylesheet. Plain-text output is
  markdown-stripped (not HTML tags). We degrade gracefully to
  `navigator.clipboard.writeText` and finally `document.execCommand('copy')` for
  older Safari / non-secure contexts.
- **Error boundary at two layers:** one at the app root (`main.jsx`) and one
  wrapping the markdown viewport, so a pathological document never blanks the
  page — you still see the raw text.
- **Architecture (SOLID):**
  - `useFileUpload` owns the ingestion lifecycle (validation, reading, state).
  - `useClipboardExport` depends on a `{ element, markdown }` shape, not the
    live DOM/state directly — trivially unit-testable.
  - `MarkdownRenderer` accepts a `components` override map so custom renderers
    (Code, Image, Link) are additive extensions, not edits to a monolith.
- **Download-app-ZIP** in the header uses `import.meta.glob('/src/**/*', { as: 'raw' })`
  to snapshot the actual source at build time, packages it with `jszip`, and
  streams it via `file-saver`. No server ever sees a request.
- **Dark mode:** Tailwind `dark:` variant driven by a header toggle, persisted
  to `localStorage`. Respects the initial `prefers-color-scheme`.
- **Accessibility:** semantic headings preserved in the output, keyboard-operable
  dropzone (Enter/Space to browse), visible focus rings, `aria-live` region
  for copy-success, image alt-text is honored.

## Edge cases handled

- Malformed markdown (unclosed fences / links / emphasis) — parser is forgiving;
  if it does throw, the boundary shows raw text.
- Mixed line endings (CRLF / LF) and UTF-8 BOM are normalized on read.
- Long unbroken strings wrap via `overflow-wrap: break-word`.
- Broken images render an inline "image unavailable" chip instead of layout breakage.
- Empty file / oversize file / binary file → friendly, non-technical error banner.
- Task lists render as checkboxes (checked/unchecked), not literal `[ ]`.
- Tables honour column alignment (`:---`, `:---:`, `---:`).

## What I'd improve with more time

- **Virtualization for huge documents** (10k+ lines). Currently the whole tree
  is rendered — the pipeline is fast enough for the target size but wouldn't
  scale to book-length input without windowing.
- **A collapsible table-of-contents sidebar** generated from headings, with
  scroll-spy. Sketched, dropped to protect the required feature set.
- **Anchor slugs with deduplication** for repeated heading text (currently
  headings render without `id`s to sidestep collisions).
- **User-supplied theme presets** (solarized, dracula) for the syntax
  highlighter.
- **A "print/PDF" button** using the browser's print pipeline with the same
  inlined-style transform we use for the clipboard.

