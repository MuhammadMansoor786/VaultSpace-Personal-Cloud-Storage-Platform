/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Folder,
  ChevronRight,
  FolderPlus,
  MoreVertical,
  Edit2,
  Trash2,
  HardDrive,
  FolderOpen,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { getFolderPath } from '../utils/vault-logic';
import type { VaultFolder } from '../types/vault';

interface FolderViewProps {
  onOpenCreateFolder: () => void;
}

export const FolderView: React.FC<FolderViewProps> = ({ onOpenCreateFolder }) => {
  const {
    folders,
    currentFolderId,
    setCurrentFolderId,
    files,
    renameFolder,
    trashFolder,
  } = useVault();

  const [activeMenuFolderId, setActiveMenuFolderId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const breadcrumbs = getFolderPath(folders, currentFolderId);

  // Subfolders in current level
  const subfolders = folders.filter(
    f => !f.isTrash && f.parentId === currentFolderId
  );

  const getSubfolderItemCount = (folderId: string) => {
    return files.filter(f => !f.isTrash && f.folderId === folderId).length;
  };

  const handleStartRename = (folder: VaultFolder) => {
    setEditingFolderId(folder.id);
    setRenameValue(folder.name);
    setActiveMenuFolderId(null);
  };

  const handleSaveRename = (folderId: string) => {
    if (renameValue.trim()) {
      renameFolder(folderId, renameValue.trim());
    }
    setEditingFolderId(null);
  };

  return (
    <div className="mb-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400 py-1 mb-4">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.id || 'root'}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              <button
                onClick={() => setCurrentFolderId(crumb.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  isLast
                    ? 'font-bold text-slate-900 dark:text-white bg-slate-200/60 dark:bg-slate-800'
                    : 'hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
              >
                {idx === 0 ? <HardDrive className="w-3.5 h-3.5 text-indigo-500" /> : <FolderOpen className="w-3.5 h-3.5" />}
                <span>{crumb.name}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Subfolders Grid */}
      {subfolders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Folders ({subfolders.length})
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {subfolders.map(folder => {
              const count = getSubfolderItemCount(folder.id);
              const isEditing = editingFolderId === folder.id;

              return (
                <div
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="group relative p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${folder.color}15`, color: folder.color }}
                    >
                      <Folder className="w-5 h-5 fill-current" />
                    </div>

                    {/* Folder Context Menu Trigger */}
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          setActiveMenuFolderId(prev => (prev === folder.id ? null : folder.id))
                        }
                        aria-label="Folder actions"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuFolderId === folder.id && (
                        <div
                          className="absolute right-0 top-6 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-20 text-xs font-medium animate-fadeIn"
                        >
                          <button
                            onClick={() => handleStartRename(folder)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Rename
                          </button>
                          <button
                            onClick={() => {
                              trashFolder(folder.id);
                              setActiveMenuFolderId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Move to Trash
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Folder Name & Item Count */}
                  <div className="mt-3">
                    {isEditing ? (
                      <div onClick={e => e.stopPropagation()} className="flex items-center gap-1">
                        <input
                          type="text"
                          autoFocus
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveRename(folder.id);
                            if (e.key === 'Escape') setEditingFolderId(null);
                          }}
                          className="w-full py-0.5 px-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-indigo-500 rounded text-slate-900 dark:text-white"
                        />
                        <button
                          onClick={() => handleSaveRename(folder.id)}
                          className="text-xs text-indigo-600 font-bold px-1"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {folder.name}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {count} {count === 1 ? 'file' : 'files'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
