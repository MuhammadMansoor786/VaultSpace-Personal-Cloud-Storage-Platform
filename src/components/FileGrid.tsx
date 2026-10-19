/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutGrid,
  List,
  ArrowUpDown,
  Upload,
  FolderPlus,
  Trash2,
  AlertTriangle,
  FolderX,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { FileCard } from './FileCard';
import { FileList } from './FileList';
import type { SortField, SortOrder } from '../types/vault';

interface FileGridProps {
  onOpenCreateFolder: () => void;
}

export const FileGrid: React.FC<FileGridProps> = ({ onOpenCreateFolder }) => {
  const {
    filteredFiles,
    viewMode,
    setViewMode,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    selectedFileIds,
    toggleSelectFile,
    selectAllFiles,
    clearSelection,
    setActivePreviewFile,
    setActiveVersionFile,
    setIsUploadModalOpen,
    activeTab,
    emptyTrash,
  } = useVault();

  const isTrashView = activeTab === 'trash';
  const allSelected =
    filteredFiles.length > 0 && filteredFiles.every(f => selectedFileIds.includes(f.id));

  const handleToggleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllFiles(filteredFiles.map(f => f.id));
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div>
      {/* Trash Header Notice (Phase 4 & 6) */}
      {isTrashView && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Trash Quarantine (30-Day Auto Retention)
              </h5>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Items in trash are permanently purged after 30 days. You can restore them or empty trash immediately.
              </p>
            </div>
          </div>
          {filteredFiles.length > 0 && (
            <button
              onClick={emptyTrash}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Empty Trash Now
            </button>
          )}
        </div>
      )}

      {/* Control Bar: View Switcher, Select All, and Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Left: Item Counter & Select All */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSelectAll}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Right: Sort controls & Grid/List toggles */}
        <div className="flex items-center gap-2">
          {/* Sort Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
            <label htmlFor="sort-field-select" className="sr-only">Sort files by</label>
            <select
              id="sort-field-select"
              value={sortField}
              onChange={e => setSortField(e.target.value as SortField)}
              className="bg-transparent border-0 text-slate-700 dark:text-slate-300 font-medium px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="type">Type</option>
            </select>
            <button
              onClick={toggleSortOrder}
              aria-label={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Toggle: Interactive segmented buttons */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Content */}
      {filteredFiles.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 my-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center mb-4">
            <FolderX className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            {isTrashView ? 'Trash is Empty' : 'No Files Found'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {isTrashView
              ? 'Files deleted from your vault will appear here for safe keeping.'
              : 'Upload your photos, videos, confidential documents, and music to secure them.'}
          </p>

          {!isTrashView && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Files
              </button>
              <button
                onClick={onOpenCreateFolder}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                New Folder
              </button>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map(file => (
            <FileCard
              key={file.id}
              file={file}
              isSelected={selectedFileIds.includes(file.id)}
              onSelect={() => toggleSelectFile(file.id)}
              onOpenPreview={() => setActivePreviewFile(file)}
              onOpenVersions={() => setActiveVersionFile(file)}
            />
          ))}
        </div>
      ) : (
        <FileList
          files={filteredFiles}
          onOpenPreview={file => setActivePreviewFile(file)}
          onOpenVersions={file => setActiveVersionFile(file)}
        />
      )}
    </div>
  );
};
