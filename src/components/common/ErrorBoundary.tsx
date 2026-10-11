import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertOctagon, RotateCcw, Copy, Check } from "lucide-react";
import { Button } from "@/components/common/Button";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("core", "Uncaught runtime error caught by ErrorBoundary", {
      error,
      errorInfo,
    });
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    });
    window.location.reload();
  };

  private handleCopyDiagnostics = () => {
    const diagnosticData = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
    };

    navigator.clipboard
      .writeText(JSON.stringify(diagnosticData, null, 2))
      .then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
      });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-400px h-full p-8 text-center bg-slate-950 text-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            <AlertOctagon className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-bold text-slate-100">
            {this.props.fallbackTitle ||
              "Terjadi Kesalahan pada Kanvas / Komponen"}
          </h2>
          <p className="text-sm text-slate-400 max-w-md mt-1 mb-6">
            Modul visual otomata mengalami kesalahan runtime. Anda dapat memuat
            ulang komponen atau menyalin data diagnostik untuk pemeriksaan.
          </p>

          {this.state.error && (
            <div className="w-full max-w-lg p-3.5 mb-6 text-left rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={
                this.state.copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )
              }
              onClick={this.handleCopyDiagnostics}
            >
              {this.state.copied ? "Tersalin" : "Salin Diagnostik"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={this.handleReset}
            >
              Muat Ulang
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
