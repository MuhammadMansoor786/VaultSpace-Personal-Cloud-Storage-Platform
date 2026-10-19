/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, FolderPlus, Folder } from 'lucide-react';
import { useVault } from '../context/VaultContext';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOLDER_COLORS = [
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#ef4444', // red
  '#64748b', // slate
];

export const NewFolderModal: React.FC<NewFolderModalProps> = ({ isOpen, onClose }) => {
  const { createFolder, currentFolderId, folders } = useVault();
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);

  if (!isOpen) return null;

  const currentParentFolder = currentFolderId
    ? folders.find(f => f.id === currentFolderId)?.name
    : 'Vault Root';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      createFolder(folderName.trim(), currentFolderId, selectedColor);
      setFolderName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Create New Folder
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Location: <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentParentFolder}</span>
            </label>
            <input
              type="text"
              autoFocus
              required
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              placeholder="e.g. Vacation Photos, Tax Documents..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Folder Color Tag
            </label>
            <div className="flex items-center justify-between gap-1.5">
              {FOLDER_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
