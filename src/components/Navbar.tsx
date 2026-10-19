/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Upload,
  Sun,
  Moon,
  FolderPlus,
  User,
  LogOut,
  HardDrive,
  Menu,
  X,
  FileArchive,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { formatBytes } from '../utils/vault-logic';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  onOpenNewFolderModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  onOpenNewFolderModal,
}) => {
  const {
    currentUser,
    logout,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    storageBreakdown,
    setIsUploadModalOpen,
    setActiveTab,
    selectedFileIds,
    downloadSelectedAsZip,
    clearSelection,
  } = useVault();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            aria-label="Toggle Navigation Menu"
            className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveTab('files')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  VaultSpace
                </span>
                <span className="text-[10px] uppercase font-semibold text-indigo-700 dark:text-indigo-400 tracking-wider">
                  E2EE
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-600 dark:text-slate-400 -mt-0.5">
                Zero-Knowledge Personal Cloud
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-xl mx-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-400" />
            <input
              type="text"
              aria-label="Search files and tags"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search files by name, extension, or tag..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-600 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multi-selection Bulk Action */}
          {selectedFileIds.length > 0 && (
            <div className="hidden md:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-1.5 animate-fadeIn">
              <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                {selectedFileIds.length} selected
              </span>
              <button
                onClick={downloadSelectedAsZip}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 ml-1"
              >
                <FileArchive className="w-3.5 h-3.5" />
                ZIP Download
              </button>
              <button
                onClick={clearSelection}
                className="text-xs text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 ml-1"
              >
                Clear
              </button>
            </div>
          )}

          {/* New Folder Button */}
          <button
            onClick={onOpenNewFolderModal}
            title="Create Folder"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden md:inline">New Folder</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            aria-label="Upload files"
            className="inline-flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile & Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(prev => !prev)}
              aria-label="User Account Menu"
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                {currentUser?.displayName?.charAt(0) || 'U'}
              </div>
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 px-4 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                {/* User Header */}
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {currentUser?.displayName?.charAt(0) || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {currentUser?.displayName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        @{currentUser?.username}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Zero-Knowledge Vault Active</span>
                  </div>
                </div>

                {/* Storage Meter */}
                <div className="py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                      Storage Used
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {storageBreakdown.usagePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, storageBreakdown.usagePercentage)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {formatBytes(storageBreakdown.usedBytes)} of {formatBytes(storageBreakdown.totalBytes)} used
                  </p>
                </div>

                {/* Links */}
                <div className="pt-2 space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('system');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Activity className="w-4 h-4 text-slate-400" />
                    Security & Health Logs
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('backup');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    Encrypted Backup & Recovery
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out & Lock Vault
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
