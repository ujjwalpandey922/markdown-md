import { FileText, Moon, Sun } from "lucide-react";

export default function Layout({ theme, onToggleTheme, children }) {
  return (
    <div className="min-h-screen bg-background text-foreground noise-bg">
      <header
        className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl"
        data-testid="app-header"
      >
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <a
            href="/"
            className="group flex items-center gap-2.5"
            data-testid="app-logo"
          >
            <span className="grid h-8 w-8 place-items-center rounded-sm border border-foreground/80 bg-foreground text-background">
              <FileText size={16} strokeWidth={2.5} />
            </span>
            <span className="flex items-baseline gap-1.5 font-[IBM_Plex_Mono] text-sm tracking-tight">
              <span className="font-semibold">MDR</span>
              <span className="hidden text-muted-foreground sm:inline">
                / markdown renderer
              </span>
            </span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              data-testid="theme-toggle-btn"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-transparent text-foreground transition-colors hover:bg-muted"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main data-testid="app-main">{children}</main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:px-8">
          <span className="font-[IBM_Plex_Mono] tracking-[0.15em]">
            MDR · GFM · CLIENT-ONLY
          </span>
          <span className="font-[IBM_Plex_Mono] tracking-[0.15em]">
            NO NETWORK · NO TELEMETRY
          </span>
        </div>
      </footer>
    </div>
  );
}
