import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// Map technical error patterns to user-friendly Chinese messages
function getUserFriendlyMessage(error: Error | null): string {
    if (!error) return "发生了未知错误，请稍后重试";
    const msg = error.message.toLowerCase();
    if (msg.includes("quota") || msg.includes("402")) return "数据库暂时不可用，请稍后重试";
    if (msg.includes("unique constraint") || msg.includes("p2002")) return "已存在重复记录，请检查后重试";
    if (msg.includes("not found") || msg.includes("p2025")) return "找不到相关数据";
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("connection")) return "网络连接失败，请检查网络后重试";
    if (msg.includes("permission") || msg.includes("unauthorized") || msg.includes("401") || msg.includes("403")) return "权限不足，请重新登录后重试";
    return "发生了错误，请稍后重试";
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[ErrorBoundary]", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-8">
                    <div className="text-center space-y-4 max-w-md">
                        <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">出错了</h2>
                        <p className="text-muted-foreground text-sm">
                            {getUserFriendlyMessage(this.state.error)}
                        </p>
                        {this.state.error && (
                            <details className="text-xs text-muted-foreground/50 text-left bg-white/5 p-3 rounded-xl max-h-32 overflow-auto">
                                <summary className="cursor-pointer font-medium">查看技术详情</summary>
                                <pre className="mt-2 whitespace-pre-wrap font-mono">{this.state.error.message}</pre>
                            </details>
                        )}
                        <button
                            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all"
                        >
                            重试
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
