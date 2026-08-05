export default function EmptyState() {
  return (
    <section
      className="flex flex-col gap-3"
      data-testid="empty-state"
      aria-labelledby="empty-state-heading"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
        <span>01</span>
        <span>·</span>
        <span>Upload</span>
      </div>

      <h1
        id="empty-state-heading"
        className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl text-foreground"
      >
        Drop a markdown file.
        <span className="block text-gradient mt-1">
          See it, copy it, ship it.
        </span>
      </h1>

      <p className="max-w-[62ch] text-base text-muted-foreground/80 sm:text-lg mt-3 leading-relaxed">
        A precise, offline viewer for GitHub-Flavored Markdown. Copies to Word,
        Google Docs, Slack, Notion — with formatting intact.
      </p>
    </section>
  );
}
