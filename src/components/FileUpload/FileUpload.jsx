import { useRef } from "react";
import { AlertCircle, FileUp, Loader2, UploadCloud } from "lucide-react";

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
    ? "border-solid border-accent bg-accent/5 ring-2 ring-accent"
    : status === "error"
      ? "border-solid border-destructive/60 bg-destructive/5"
      : "border-transparent bg-muted/30 dropzone-idle";

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
        className={`group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-4 rounded-md border p-10 text-center transition-colors ${stateClass}`}
      >
        <div className="pointer-events-none flex h-16 w-16 items-center justify-center rounded-full border border-foreground/70 bg-background text-foreground">
          {isParsing ? (
            <Loader2 className="animate-spin" size={26} />
          ) : (
            <UploadCloud size={28} strokeWidth={1.5} />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-[Work_Sans] text-xl font-semibold tracking-tight">
            {isParsing ? "Reading your file…" : "Drop a markdown file here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or{" "}
            <span className="underline decoration-accent decoration-2 underline-offset-4">
              click to browse
            </span>{" "}
            — .md, .markdown, .txt · up to 5 MB
          </p>
        </div>

        <span className="pointer-events-none inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-[IBM_Plex_Mono] text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <FileUp size={11} /> single file · offline
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
