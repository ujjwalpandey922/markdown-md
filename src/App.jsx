import { useCallback, useEffect, useState } from "react";
import { Toaster } from "sonner";
import Layout from "@/components/Layout/Layout.jsx";
import FileUpload from "@/components/FileUpload/FileUpload.jsx";
import MarkdownRenderer from "@/components/MarkdownRenderer/MarkdownRenderer.jsx";
import DocumentToolbar from "@/components/DocumentToolbar/DocumentToolbar.jsx";
import EmptyState from "@/components/EmptyState/EmptyState.jsx";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary.jsx";
import useFileUpload from "@/hooks/useFileUpload.js";

/**
 * Root app shell.
 * Owns high-level state (theme, current file) and composes the file
 * ingestion + rendering + toolbar layers. Kept small on purpose — each
 * child module handles its own concern (SRP).
 */
export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem("mdr-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    window.localStorage.setItem("mdr-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const upload = useFileUpload();

  return (
    <>
      <Layout theme={theme} onToggleTheme={toggleTheme}>
        {upload.status === "loaded" ? (
          <div className="mx-auto w-full max-w-[880px] px-4 pb-24 pt-8 sm:px-8">
            <DocumentToolbar
              file={upload.file}
              markdown={upload.markdown}
              onClear={upload.reset}
            />
            <ErrorBoundary
              fallback={
                <div
                  className="mt-6 rounded-md border border-destructive/40 bg-destructive/5 p-6"
                  data-testid="renderer-error-fallback"
                >
                  <h3 className="font-semibold text-destructive">
                    Couldn&apos;t render this document
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The markdown parser hit an unexpected node. Your original
                    text is preserved below.
                  </p>
                  <pre className="mt-4 max-h-[60vh] overflow-auto rounded border border-border bg-muted p-4 text-xs">
                    {upload.markdown}
                  </pre>
                </div>
              }
            >
              <MarkdownRenderer markdown={upload.markdown} />
            </ErrorBoundary>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-[880px] flex-col gap-8 px-4 pb-24 pt-10 sm:px-8">
            <EmptyState />
            <FileUpload
              status={upload.status}
              error={upload.error}
              onFile={upload.acceptFile}
              onLoadSample={upload.loadSample}
              onDragStateChange={upload.setDragging}
              isDragging={upload.isDragging}
              isParsing={upload.isParsing}
            />
          </div>
        )}
      </Layout>
      <Toaster
        richColors
        position="bottom-right"
        theme={theme}
        toastOptions={{ duration: 2500 }}
      />
    </>
  );
}
