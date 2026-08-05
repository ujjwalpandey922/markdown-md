import { Sparkles } from "lucide-react";

export default function EmptyState() {
  return (
    <section
      className="flex flex-col gap-3"
      data-testid="empty-state"
      aria-labelledby="empty-state-heading"
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 font-[IBM_Plex_Mono] text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <Sparkles size={11} /> client-only · zero uploads
      </span>
      <h1
        id="empty-state-heading"
        className="font-[Work_Sans] text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
      >
        Read markdown the way{" "}
        <span className="text-accent">it was meant</span> to be read.
      </h1>
      <p className="max-w-[62ch] text-base text-muted-foreground sm:text-lg">
        Drop a <code className="rounded bg-muted px-1.5 py-0.5 font-[JetBrains_Mono] text-[0.85em]">.md</code>{" "}
        file below. The renderer covers the full GitHub-Flavored spec — tables,
        task lists, fenced code with syntax highlighting, nested quotes — and
        the copy button hands you a rich-text payload that pastes cleanly into
        Word, Google Docs, Slack, or Notion.
      </p>
    </section>
  );
}
