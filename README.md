# MDR — Markdown Renderer

A production-grade, client-side viewer for GitHub-Flavored Markdown. Drop a `.md` file in, view complex markdown accurately, and copy the result as rich text that pastes cleanly into Microsoft Word, Google Docs, Slack, Notion, or rich text editors. No backend, no accounts, 100% browser-side.

---

## Setup & Running Locally

1. **Clone the repository:**
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd markdown-renderer
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Run development server:**
   ```bash
   yarn dev
   # or
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build for production:**
   ```bash
   yarn build
   # or
   npm run build
   ```
   The static build output in `build/` (or `dist/`) is deploy-ready for Vercel, Netlify, or Cloudflare Pages — no server runtime required.

---

## Key Architecture & Design Decisions

- **Multi-MIME Clipboard Engine:** Implemented `buildClipboardPayload()` in `src/lib/markdownToClipboard.js` to construct a multi-format payload via `navigator.clipboard.write([new ClipboardItem(...)])`:
  - `text/html`: Inlines CSS styles onto semantic HTML tags (`<strong>`, `<em>`, `<table>`, `<blockquote>`, `<pre>`) so formatted text pastes cleanly into MS Word and Google Docs.
  - `text/plain`: Clean human-readable text representation.
  - `text/markdown`: Raw Markdown source representation where supported by the browser.
  - Fallbacks gracefully to `writeText` or `execCommand('copy')` on older browsers.

- **GitHub-Flavored Callouts:** Built a custom `MdBlockquote` component that detects GitHub alert markers (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`), strips the literal marker text, and renders styled alert cards with corresponding Lucide icons (`Info`, `Lightbulb`, `AlertCircle`, `AlertTriangle`, `ShieldAlert`).

- **Reactive Theme System:** Code blocks and syntax highlighters use a `MutationObserver` on `document.documentElement` to reactively toggle between light (`oneLight`) and dark (`oneDark`) themes in real-time when the theme mode changes.

- **LaTeX Math Rendering:** Integrated `remark-math` and `rehype-katex` with `{ throwOnError: false }` and KaTeX CSS styling. Equation blocks (`$$...$$`) and inline math (`$...$`) render formatted typography and display invalid math errors gracefully in-line (mirroring GitHub's preview engine).

- **Fault-Tolerant Parsing & Sanitization:** Pipeline powered by `react-markdown` + `remark-gfm` + `rehype-raw` + `rehype-sanitize`. Sanitization rules allow custom `className` attributes on `div`, `span`, and `code` for math and syntax highlighting while stripping dangerous scripts. Sealed with a React `ErrorBoundary` fallback to render raw text if parsing fails.

- **Clean Component Architecture (SOLID):**
  - `useFileUpload`: Manages ingestion, validation, reading, and state.
  - `useClipboardExport`: Handles clipboard copying without direct DOM coupling.
  - `MarkdownRenderer`: Provides an extensible `components` map for custom element overrides (`CodeBlock`, `MdBlockquote`, `MdLink`, `MdImage`).

---

## Use of AI Coding Assistants

- Utilized AI pair programming assistance to refine custom AST blockquote parsers, build cross-browser multi-MIME clipboard fallback pipelines, and configure KaTeX sanitize schema attribute rules.

---

## Edge Cases Handled

- **Malformed Markdown:** Parser handles unclosed code fences, missing link syntax, and malformed lists. Error boundary prevents blank screens.
- **LaTeX Math Syntax Errors:** Handled via `throwOnError: false` to highlight errors visually without crashing.
- **Encoding & Line Endings:** Normalizes mixed line endings (CRLF / LF) and UTF-8 BOM on file read.
- **Layout Overflow:** Long unbroken strings wrap safely using `overflow-wrap: break-word`.
- **Broken Images:** Displays an inline "image unavailable" chip instead of layout breakage.
- **File Validation:** Friendly error banners for empty files, oversized files, or binary uploads.

---

## Future Improvements (With Additional Time)

- **Live Side-by-Side Editing:** Add a dual-pane editor and live preview mode with real-time scroll sync.
- **PDF & HTML Document Export:** Add one-click export buttons for downloading standalone HTML or PDF files.
- **Collapsible Table of Contents:** Automatically generate a sticky sidebar table of contents with scroll-spy navigation.
- **Virtualization for Large Documents:** Implement list/DOM windowing for 10k+ line Markdown files.
