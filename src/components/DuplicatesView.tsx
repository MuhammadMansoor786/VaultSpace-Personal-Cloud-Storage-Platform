/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Copy,
  Trash2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Folder,
  File,
  Check,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { formatBytes } from '../utils/vault-logic';

export const DuplicatesView: React.FC = () => {
  const { duplicateGroups, cleanDuplicates, trashFile, folders } = useVault();
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanedNotice, setCleanedNotice] = useState<string | null>(null);

  const totalWastedBytes = duplicateGroups.reduce((acc, g) => acc + g.wastedBytes, 0);

  const handleCleanAll = async () => {
    setIsCleaning(true);
    const count = await cleanDuplicates();
    setIsCleaning(false);
    setCleanedNotice(`Cleaned ${count} duplicate file(s) and reclaimed storage!`);
    setTimeout(() => setCleanedNotice(null), 4000);
  };

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return 'Vault Root';
    const f = folders.find(fold => fold.id === folderId);
    return f ? f.name : 'Unknown folder';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Copy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Duplicate File Detector
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Identifies identical files with bit-for-bit SHA-256 cryptographic match to reclaim wasted storage.
            </p>
          </div>
        </div>

        {duplicateGroups.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Recoverable Space</span>
              <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                {formatBytes(totalWastedBytes)}
              </span>
            </div>
            <button
              onClick={handleCleanAll}
              disabled={isCleaning}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isCleaning ? 'Cleaning...' : 'Clean All Duplicates'}</span>
            </button>
          </div>
        )}
      </div>

      {cleanedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{cleanedNotice}</span>
        </div>
      )}

      {/* Duplicate Groups List */}
      {duplicateGroups.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Zero Duplicate Files Found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Your vault is perfectly organized. All active files have unique cryptographic checksums.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicateGroups.map((group, idx) => (
            <div
              key={group.checksum}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Group #{idx + 1} ({group.files.length} Copies)
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Wasting {formatBytes(group.wastedBytes)}
                  </span>
                </div>
                <code className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  SHA-256: {group.checksum.slice(0, 16)}...
                </code>
              </div>

              <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                {group.files.map((file, fileIdx) => {
                  const isOriginal = fileIdx === 0;
                  return (
                    <div
                      key={file.id}
                      className="py-2.5 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <File className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white truncate">
                              {file.name}
                            </span>
                            {isOriginal ? (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
                                Keep (Original)
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-rose-500 dark:text-rose-400">
                                Duplicate Copy
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Folder className="w-3 h-3 text-slate-400" />
                            <span>{getFolderName(file.folderId)}</span>
                            <span>·</span>
                            <span>Uploaded {new Date(file.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>

                      {!isOriginal && (
                        <button
                          onClick={() => trashFile(file.id)}
                          className="px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Copy
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
