import { Moon, Sun } from "lucide-react";

export default function Layout({ theme, onToggleTheme, children }) {
  return (
    <div className="min-h-screen bg-background text-foreground noise-bg grid-bg">
      <header
        className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md"
        data-testid="app-header"
      >
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <a
            href="/"
            className="group flex items-center gap-3"
            data-testid="app-logo"
          >
            <span className="grid h-8 w-8 place-items-center rounded bg-foreground text-background font-black text-lg transition-transform group-hover:scale-105">
              G
            </span>
            <span className="flex items-center gap-2 font-[IBM_Plex_Mono] max-sm:hidden text-xs tracking-wider uppercase">
              <span className="font-bold text-foreground">Grid.md</span>
              <span className="text-muted-foreground/40">MARKDOWN</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-muted-foreground/40">LOCAL</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-muted-foreground/40">V1</span>
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
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border/80 bg-background text-foreground hover:bg-muted text-[11px] font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              {theme === "dark" ? (
                <>
                  <Sun size={12} className="text-amber-500" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon size={12} className="text-indigo-500" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main data-testid="app-main">{children}</main>

      <footer className="border-t border-border/40 py-6 mt-12 bg-background/50">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 text-[10px] text-muted-foreground/80 sm:px-8 uppercase font-[IBM_Plex_Mono] tracking-[0.2em]">
          <span>GRID.MD · GFM · CLIENT-ONLY</span>
          <span className="hidden sm:inline">NO NETWORK · NO TELEMETRY</span>
        </div>
      </footer>
    </div>
  );
}
