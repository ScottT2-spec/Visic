"use client";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Search, Shield } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface AuditLogEntry {
  id: string; action: string; entity: string; entityId: string | null;
  userId: string | null; ip: string | null; before: unknown; after: unknown;
  createdAt: string;
}

const actionColors: Record<string, string> = {
  CREATE: "bg-green-50 text-green-700", UPDATE: "bg-blue-50 text-blue-700",
  DELETE: "bg-red-50 text-red-700",
};

export default function AuditLogPage() {
  const { currentStore } = useSite();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entities, setEntities] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "30" });
    if (entityFilter) params.set("entity", entityFilter);
    if (actionFilter) params.set("action", actionFilter);
    const res = await api.get<{ logs: AuditLogEntry[]; filters: { entities: string[]; actions: string[] }; pagination: { pages: number } }>(`/api/sites/${currentStore.id}/audit-log?${params}`);
    if (res.success && res.data) {
      setLogs(res.data.logs || []);
      setEntities(res.data.filters?.entities || []);
      setActions(res.data.filters?.actions || []);
      setTotalPages(res.data.pagination?.pages || 1);
    }
    setLoading(false);
  }, [currentStore, page, entityFilter, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  if (!currentStore) return <div className="p-6 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-surface-900 font-display">Audit Log</h1><p className="text-sm text-surface-500 mt-1">Track all changes made to your site</p></div>

      <div className="flex items-center gap-3 flex-wrap">
        <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }} className="input-field py-2.5 text-sm">
          <option value="">All Entities</option>
          {entities.map((e) => <option key={e} value={e}>{e.replace(/_/g, " ")}</option>)}
        </select>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="input-field py-2.5 text-sm">
          <option value="">All Actions</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
      : logs.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4"><Shield className="h-7 w-7 text-surface-300" /></div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No audit logs yet</h3>
          <p className="text-sm text-surface-500">Actions performed on your site will be logged here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-surface-200 bg-white overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-50">
                {expandedId === log.id ? <ChevronDown className="h-4 w-4 text-surface-400 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-surface-400 flex-shrink-0" />}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${actionColors[log.action] || "bg-surface-100 text-surface-500"}`}>{log.action}</span>
                <span className="text-sm font-medium text-surface-700 flex-shrink-0">{log.entity.replace(/_/g, " ")}</span>
                {log.entityId && <span className="text-xs text-surface-400 font-mono truncate">{log.entityId}</span>}
                <span className="flex-1" />
                <span className="text-xs text-surface-400 flex-shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
              </button>
              {expandedId === log.id && (
                <div className="border-t border-surface-100 px-4 py-3 bg-surface-50 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {log.before ? (
                      <div>
                        <p className="text-xs font-semibold text-red-600 mb-1">Before</p>
                        <pre className="text-xs text-surface-600 bg-white rounded-lg p-3 overflow-x-auto max-h-48 border border-surface-100">{JSON.stringify(log.before, null, 2)}</pre>
                      </div>
                    ) : null}
                    {log.after ? (
                      <div>
                        <p className="text-xs font-semibold text-green-600 mb-1">After</p>
                        <pre className="text-xs text-surface-600 bg-white rounded-lg p-3 overflow-x-auto max-h-48 border border-surface-100">{JSON.stringify(log.after, null, 2)}</pre>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-surface-400">
                    {log.userId && <span>User: {log.userId}</span>}
                    {log.ip && <span>IP: {log.ip}</span>}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary text-xs py-1.5 px-3">Previous</button>
              <span className="text-sm text-surface-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary text-xs py-1.5 px-3">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
