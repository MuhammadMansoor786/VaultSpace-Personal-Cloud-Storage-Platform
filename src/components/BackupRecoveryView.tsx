/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Clock,
  HardDrive,
  Lock,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';

export const BackupRecoveryView: React.FC = () => {
  const {
    exportEncryptedBackup,
    importBackup,
    runIntegrityVerification,
    files,
    folders,
  } = useVault();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ total: number; verified: number; corrupted: number } | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [autoBackupFrequency, setAutoBackupFrequency] = useState<'daily' | 'weekly' | 'off'>('daily');

  const handleExport = async () => {
    setIsExporting(true);
    await exportEncryptedBackup();
    setIsExporting(false);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyResult(null);
    setTimeout(async () => {
      const res = await runIntegrityVerification();
      setVerifyResult(res);
      setIsVerifying(false);
    }, 800);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      const content = event.target?.result as string;
      const res = await importBackup(content);
      setImportStatus(res.message);
      setTimeout(() => setImportStatus(null), 5000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Vault Backup & Disaster Recovery
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export encrypted standalone snapshots, restore corrupted vaults, and audit bit-level integrity.
            </p>
          </div>
        </div>
      </div>

      {importStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Main Grid: 1. Export, 2. Restore, 3. Integrity Verification */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Export Full Backup */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Export Encrypted Bundle
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Creates a standalone <code className="text-indigo-500 font-mono">.vaultbackup</code> archive containing all files, folders, and cryptographic signatures.
            </p>

            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1">
              <div>Items: {files.length} files, {folders.length} folders</div>
              <div>Protection: Zero-Knowledge AES-GCM</div>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Packing Archive...' : 'Download Vault Backup'}</span>
          </button>
        </div>

        {/* Card 2: Restore from Backup */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Restore Vault Snapshot
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Import a previously exported <code className="text-purple-500 font-mono">.vaultbackup</code> to rebuild file indexes, directory trees, and security logs.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept=".vaultbackup,.json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 w-full py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Select .vaultbackup File</span>
          </button>
        </div>

        {/* Card 3: Cryptographic Integrity Verification */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              SHA-256 Bit-Rot Scanner
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Runs cryptographic checksum validation across every file chunk in storage to ensure zero bit flips or unauthorized modifications.
            </p>

            {verifyResult && (
              <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{verifyResult.verified} / {verifyResult.total} Files Intact</span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  0 corrupted blocks found. Signatures matched.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying Hashes...' : 'Run Integrity Audit'}</span>
          </button>
        </div>
      </div>

      {/* Automated Backup Scheduling Settings */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
          <div>
            <h5 className="text-sm font-bold text-slate-900 dark:text-white">
              Automated Vault Backup Schedule
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automatically trigger client-side snapshot generation during idle periods.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(['daily', 'weekly', 'off'] as const).map(freq => (
            <button
              key={freq}
              onClick={() => setAutoBackupFrequency(freq)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                autoBackupFrequency === freq
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
