/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  File,
  Star,
  Download,
  Trash2,
  Lock,
  History,
  FolderInput,
} from 'lucide-react';
import type { VaultFile } from '../types/vault';
import { formatBytes } from '../utils/vault-logic';
import { useVault } from '../context/VaultContext';

interface FileListProps {
  files: VaultFile[];
  onOpenPreview: (file: VaultFile) => void;
  onOpenVersions: (file: VaultFile) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onOpenPreview,
  onOpenVersions,
}) => {
  const {
    selectedFileIds,
    toggleSelectFile,
    selectAllFiles,
    clearSelection,
    toggleFavorite,
    trashFile,
    restoreFile,
    deleteFilePermanently,
    downloadFile,
  } = useVault();

  const allSelected = files.length > 0 && files.every(f => selectedFileIds.includes(f.id));

  const handleToggleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllFiles(files.map(f => f.id));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'photo':
        return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-purple-500" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-emerald-500" />;
      default:
        return <File className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold select-none">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  aria-label="Select all files"
                  checked={allSelected}
                  onChange={handleToggleSelectAll}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4 hidden sm:table-cell">Category</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4 hidden md:table-cell">Created Date</th>
              <th className="py-3 px-4 hidden lg:table-cell">Security</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {files.map(file => {
              const isSelected = selectedFileIds.includes(file.id);
              return (
                <tr
                  key={file.id}
                  onClick={() => onOpenPreview(file)}
                  className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td
                    className="py-3 px-4"
                    onClick={e => {
                      e.stopPropagation();
                      toggleSelectFile(file.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                  </td>

                  {/* File Name & Icon */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                        {getCategoryIcon(file.category)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                          {file.name}
                        </p>
                        {file.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {file.tags.slice(0, 3).map((tag, i) => (
                              <React.Fragment key={tag}>
                                {i > 0 && <span>·</span>}
                                <span>#{tag}</span>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 hidden sm:table-cell text-slate-500 dark:text-slate-400 capitalize">
                    {file.category}
                  </td>

                  {/* Size */}
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {formatBytes(file.size)}
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 hidden md:table-cell text-slate-500 dark:text-slate-400">
                    {new Date(file.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Security Badge */}
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      <Lock className="w-3 h-3" />
                      <span>AES-256</span>
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1"
                      onClick={e => e.stopPropagation()}
                    >
                      {!file.isTrash ? (
                        <>
                          <button
                            onClick={() => toggleFavorite(file.id)}
                            aria-label="Toggle Star"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'text-amber-400 fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => onOpenVersions(file)}
                            title="Versions"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => downloadFile(file)}
                            title="Download"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => trashFile(file.id)}
                            title="Trash"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => restoreFile(file.id)}
                            title="Restore"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          >
                            <FolderInput className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteFilePermanently(file.id)}
                            title="Permanently Delete"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
