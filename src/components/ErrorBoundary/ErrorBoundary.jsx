import React from "react";

/**
 * Robust error boundary. Catches render-time explosions from react-markdown
 * or any child. Two use-modes:
 *   1) Fallback prop passed → render that node.
 *   2) No fallback → render a friendly built-in shell (used at app root).
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // No telemetry — we just log to console for debugging.
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        data-testid="app-error-boundary"
        className="mx-auto mt-24 max-w-md rounded-md border border-destructive/40 bg-destructive/5 p-6 text-center"
      >
        <h2 className="text-lg font-semibold text-destructive">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {this.state.error?.message || "Unexpected error."}
        </p>
        <button
          type="button"
          onClick={this.reset}
          className="mt-4 rounded border border-border bg-background px-4 py-1.5 text-sm hover:bg-muted"
        >
          Try again
        </button>
      </div>
    );
  }
}
