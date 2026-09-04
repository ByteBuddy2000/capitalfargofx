import React, { useState } from 'react';
import { 
  ScrollText, 
  Search
} from 'lucide-react';
import { User, AuditLog } from '../../types';
import { storage } from '../../lib/storage';
import { Modal } from '../ui/Modal';

interface AdminAuditLogsProps {
  currentUser: User;
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const logs = storage.getAuditLogs();

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  const filtered = logs.filter(log => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchActor = log.actorUsername.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchNotes = log.notes ? log.notes.toLowerCase().includes(q) : false;
      const matchEntity = log.entity.toLowerCase().includes(q);
      if (!matchActor && !matchAction && !matchNotes && !matchEntity) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ScrollText className="w-6 h-6 text-amber-400" />
            System Audit Trail & Security Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cryptographically sealed and immutable audit trail of administrative approvals, ledger movements, and state transitions.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit logs by actor, action type, notes, or entity..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Actions ({logs.length})</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No audit records match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 pl-6">Action & Event</th>
                  <th className="py-3.5">Actor</th>
                  <th className="py-3.5">Entity & Target</th>
                  <th className="py-3.5">Audit Justification / Notes</th>
                  <th className="py-3.5">Timestamp</th>
                  <th className="py-3.5 text-right pr-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 pl-6">
                      <span className="font-mono font-black text-amber-400 block text-xs">
                        {log.action}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        Log #{log.id.substring(0, 12)}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="font-bold text-white block">@{log.actorUsername}</span>
                      <span className="font-mono text-[10px] text-slate-500">{log.actorId}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-slate-300 font-semibold">{log.entity}</span>
                      <span className="text-[10px] font-mono text-slate-500 block truncate max-w-[120px]">{log.entityId}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-slate-200 font-medium text-xs">
                        {log.notes || '—'}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-slate-400 text-[11px]">
                      <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-4 text-right pr-6">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold font-mono cursor-pointer transition-colors"
                      >
                        JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON State Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record: ${selectedLog.action}`}
          description={`Logged by @${selectedLog.actorUsername} at ${new Date(selectedLog.timestamp).toISOString()}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-900 rounded-xl text-xs space-y-1 font-mono text-slate-300">
              <div><strong className="text-amber-400">Action:</strong> {selectedLog.action}</div>
              <div><strong className="text-amber-400">Actor ID:</strong> {selectedLog.actorId} (@{selectedLog.actorUsername})</div>
              <div><strong className="text-amber-400">Entity:</strong> {selectedLog.entity} ({selectedLog.entityId})</div>
              <div><strong className="text-amber-400">Notes:</strong> {selectedLog.notes}</div>
            </div>

            {selectedLog.previousState && (
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Previous State</label>
                <pre className="p-3 bg-slate-100 rounded-xl text-[11px] font-mono text-slate-800 overflow-x-auto max-h-40">
                  {JSON.stringify(selectedLog.previousState, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.newState && (
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">New State</label>
                <pre className="p-3 bg-slate-100 rounded-xl text-[11px] font-mono text-slate-800 overflow-x-auto max-h-40">
                  {JSON.stringify(selectedLog.newState, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
};
