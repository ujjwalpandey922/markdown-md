import { useRef } from "react";
import { AlertCircle, Loader2, UploadCloud } from "lucide-react";

/**
 * Drag-and-drop + click-to-browse upload zone.
 * Presentation only — all lifecycle logic lives in useFileUpload.
 */
export default function FileUpload({
  status,
  error,
  onFile,
  onDragStateChange,
  isDragging,
  isParsing,
}) {
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStateChange(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) onFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) onDragStateChange(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear dragging state when leaving the zone (not a child element).
    if (e.currentTarget === e.target) onDragStateChange(false);
  };

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
    // Reset so re-selecting the same file still fires change.
    e.target.value = "";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const stateClass = isDragging
    ? "border-accent bg-accent/5 ring-2 ring-accent/30"
    : status === "error"
      ? "border-destructive/60 bg-destructive/5"
      : "border-border/60 bg-black/20 dark:bg-black/40 hover:bg-black/35 hover:border-foreground/30";

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a markdown file"
        data-testid="dropzone"
        data-state={
          isDragging
            ? "dragging"
            : status === "error"
              ? "error"
              : isParsing
                ? "parsing"
                : "idle"
        }
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        className={`group relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center gap-5 rounded-lg border-2 border-dashed p-10 text-center transition-all ${stateClass}`}
      >
        {/* Top Left Badge */}
        <span className="absolute top-4 left-4 text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/60">
          ZONE · A
        </span>

        {/* Upload Icon */}
        <div className="pointer-events-none flex h-14 w-14 items-center justify-center rounded-full border border-border/80 bg-background/50 text-foreground/80 shadow-sm group-hover:scale-105 transition-all">
          {isParsing ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <UploadCloud size={22} strokeWidth={1.8} />
          )}
        </div>

        {/* Typography content */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xl font-bold tracking-tight text-foreground">
            {isParsing
              ? "Reading your file…"
              : "Drag & drop, or click to browse"}
          </p>
          <p className="text-xs font-[IBM_Plex_Mono] tracking-wide text-muted-foreground/80">
            .md · .markdown · .txt · up to 5 MB
          </p>
        </div>

        {/* Bottom Right Badge */}
        <span className="absolute bottom-4 right-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
          LOCAL-ONLY · NO UPLOAD
        </span>

        <input
          ref={inputRef}
          type="file"
          accept=".md,.markdown,.mdown,.mkd,.mkdn,.txt,text/markdown,text/plain"
          onChange={handleChange}
          className="sr-only"
          data-testid="file-input"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {error ? (
        <div
          role="alert"
          data-testid="upload-error"
          className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}
