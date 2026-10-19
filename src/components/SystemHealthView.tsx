/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Server,
  HardDrive,
  ShieldCheck,
  Activity,
  Lock,
  Cpu,
  UserCheck,
  Search,
  Filter,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { formatBytes } from '../utils/vault-logic';
import type { AuditLog } from '../types/vault';

export const SystemHealthView: React.FC = () => {
  const {
    storageBreakdown,
    auditLogs,
    currentUser,
    loginAttempts,
  } = useVault();

  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState<string>('');

  const filteredLogs = auditLogs.filter(log => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (logSearch) {
      const q = logSearch.toLowerCase();
      return (
        log.details.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categorySegments = [
    { label: 'Photos', bytes: storageBreakdown.photosBytes, color: 'bg-blue-500' },
    { label: 'Videos', bytes: storageBreakdown.videosBytes, color: 'bg-rose-500' },
    { label: 'Documents', bytes: storageBreakdown.documentsBytes, color: 'bg-amber-500' },
    { label: 'Audio', bytes: storageBreakdown.audioBytes, color: 'bg-purple-500' },
    { label: 'Archives', bytes: storageBreakdown.archivesBytes, color: 'bg-emerald-500' },
    { label: 'Other', bytes: storageBreakdown.otherBytes, color: 'bg-slate-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              System Health & Security Audit Logs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time monitoring of storage quotas, client-side encryption state, and security event trails.
            </p>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Storage Utilization</span>
            <HardDrive className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {formatBytes(storageBreakdown.usedBytes)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {storageBreakdown.usagePercentage}% of {formatBytes(storageBreakdown.totalBytes)} quota
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Cryptographic State</span>
            <Lock className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            Zero-Knowledge
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            AES-GCM-256 + PBKDF2 (100k)
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Security Thresholds</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {loginAttempts} / 5 Attempts
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Auto-lock rate limiter active
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Session Inactivity Lock</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {currentUser?.autoLogoutMinutes || 30} Minutes
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Auto-purges master keys
          </p>
        </div>
      </div>

      {/* Storage Category Distribution Breakdown Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Storage Breakdown by File Type
        </h4>

        {/* Multi-segmented progress bar */}
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          {categorySegments.map(seg => {
            const pct = storageBreakdown.totalBytes > 0 ? (seg.bytes / storageBreakdown.totalBytes) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={seg.label}
                title={`${seg.label}: ${formatBytes(seg.bytes)} (${pct.toFixed(1)}%)`}
                className={`${seg.color} h-full transition-all`}
                style={{ width: `${Math.max(1, pct)}%` }}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          {categorySegments.map(seg => (
            <div key={seg.label} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
              <div className="overflow-hidden">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                  {seg.label}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {formatBytes(seg.bytes)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Event & Audit Logs Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Immutable Audit Trail
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chronological log of logins, uploads, client cipher events, and deletions.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <label htmlFor="audit-action-filter" className="sr-only">Filter audit logs by action</label>
            <select
              id="audit-action-filter"
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="FAILED_LOGIN">FAILED_LOGIN</option>
              <option value="UPLOAD">UPLOAD</option>
              <option value="ENCRYPT">ENCRYPT</option>
              <option value="DELETE">DELETE</option>
              <option value="DOWNLOAD">DOWNLOAD</option>
              <option value="INTEGRITY_CHECK">INTEGRITY_CHECK</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-bold text-[10px] ${
                        log.status === 'SUCCESS'
                          ? 'text-emerald-500'
                          : log.status === 'WARNING'
                          ? 'text-amber-500'
                          : 'text-rose-500'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-sans text-xs">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
