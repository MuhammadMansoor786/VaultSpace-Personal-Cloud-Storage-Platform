/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  X,
  History,
  Upload,
  CheckCircle2,
  RotateCcw,
  Clock,
  HardDrive,
  Hash,
} from 'lucide-react';
import type { VaultFile } from '../types/vault';
import { formatBytes } from '../utils/vault-logic';
import { useVault } from '../context/VaultContext';

interface FileVersionModalProps {
  file: VaultFile;
  onClose: () => void;
}

export const FileVersionModal: React.FC<FileVersionModalProps> = ({ file, onClose }) => {
  const { uploadNewVersion } = useVault();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [versionNote, setVersionNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      await uploadNewVersion(file.id, e.target.files[0], versionNote || undefined);
      setIsUploading(false);
      setVersionNote('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Version History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                {file.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close version history"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload New Version Section */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Upload New File Version
          </h4>
          <input
            type="text"
            value={versionNote}
            onChange={e => setVersionNote(e.target.value)}
            placeholder="Changelog note (e.g. 'Updated signatures', 'Added appendix')..."
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Encrypting & Committing...' : 'Select File to Upload as Next Revision'}</span>
          </button>
        </div>

        {/* Versions Timeline List */}
        <div className="mt-5 space-y-3 max-h-64 overflow-y-auto pr-1">
          {/* Current Active Version */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-700 dark:text-indigo-300">
                  Version {file.versions.length + 1} (Current Active)
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className="font-mono text-slate-500 dark:text-slate-400">
                {formatBytes(file.size)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Last saved: {new Date(file.updatedAt).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 truncate">
              SHA-256: {file.checksum}
            </p>
          </div>

          {/* Historical Versions */}
          {file.versions.map(ver => (
            <div
              key={ver.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Version {ver.versionNumber}
                </span>
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  {formatBytes(ver.size)}
                </span>
              </div>
              {ver.note && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                  "{ver.note}"
                </p>
              )}
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Uploaded: {new Date(ver.uploadedAt).toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate">
                SHA-256: {ver.checksum}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
