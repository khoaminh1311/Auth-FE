import { useState, useEffect } from 'react';
import { checkHealth } from './services/api';

export default function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const data = await checkHealth();
        setHealthStatus(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Không thể kết nối đến Backend');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-app-bg text-secondary p-6 sm:p-12 font-sans flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-xl border border-card-border shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="border-b border-card-border pb-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-tertiary text-primary mb-2">
            Phase 1 • Setup Foundation
          </div>
          <h1 className="text-2xl font-bold text-secondary">
            Auth Portal — Frontend Client
          </h1>
          <p className="text-sm text-neutral mt-1">
            React 19 + Tailwind CSS + Axios • Bảng màu Enterprise Blueprint
          </p>
        </div>

        {/* Backend Health Check Box */}
        <div className="bg-slate-50 border border-card-border rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral">
              Trạng thái kết nối Backend (GET /health)
            </span>
            {loading ? (
              <span className="text-xs font-medium text-neutral animate-pulse">
                Đang kiểm tra...
              </span>
            ) : error ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                Lỗi kết nối
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                Sẵn sàng (200 OK)
              </span>
            )}
          </div>

          <div className="font-mono text-xs bg-slate-900 text-emerald-400 p-3 rounded overflow-x-auto">
            {loading && <span>// Đang gửi request tới http://localhost:3000/health ...</span>}
            {error && <span className="text-red-400">Error: {error}</span>}
            {healthStatus && (
              <pre>{JSON.stringify(healthStatus, null, 2)}</pre>
            )}
          </div>
        </div>

        {/* Design Tokens Verification */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral">
            Bảng màu Enterprise Blueprint Tokens
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-primary text-white font-medium">
              Primary (#2563EB)
            </div>
            <div className="p-3 rounded-lg bg-secondary text-white font-medium">
              Secondary (#0F172A)
            </div>
            <div className="p-3 rounded-lg bg-tertiary text-primary font-medium border border-blue-200">
              Tertiary (#EFF6FF)
            </div>
            <div className="p-3 rounded-lg bg-neutral text-white font-medium">
              Neutral (#64748B)
            </div>
            <div className="p-3 rounded-lg bg-app-bg text-secondary font-medium border border-card-border">
              App BG (#F8FAFC)
            </div>
            <div className="p-3 rounded-lg bg-white text-secondary font-medium border-2 border-card-border">
              Card Border (#E2E8F0)
            </div>
          </div>
        </div>

        {/* Phase 1 Completion Note */}
        <div className="pt-2 border-t border-card-border flex items-center justify-between text-xs text-neutral">
          <span>Branch hiện tại: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">chore/project-setup</code></span>
          <span className="text-emerald-600 font-medium">✓ Phase 1 Ready</span>
        </div>

      </div>
    </div>
  );
}
