/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Folder,
  Image,
  Video,
  FileText,
  Music,
  Star,
  Clock,
  Copy,
  Trash2,
  ShieldAlert,
  Server,
  Lock,
  HardDrive,
  X,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { formatBytes } from '../utils/vault-logic';
import type { ActiveTab } from '../types/vault';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    setCurrentFolderId,
    files,
    storageBreakdown,
    duplicateGroups,
  } = useVault();

  // Calculate live counts
  const nonTrashFiles = files.filter(f => !f.isTrash);
  const photosCount = nonTrashFiles.filter(f => f.category === 'photo').length;
  const videosCount = nonTrashFiles.filter(f => f.category === 'video').length;
  const docsCount = nonTrashFiles.filter(f => f.category === 'document').length;
  const audioCount = nonTrashFiles.filter(f => f.category === 'audio').length;
  const favoritesCount = nonTrashFiles.filter(f => f.isFavorite).length;
  const trashCount = files.filter(f => f.isTrash).length;

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'files', label: 'All Files', icon: Folder, count: nonTrashFiles.length },
    { id: 'photos', label: 'Photos Gallery', icon: Image, count: photosCount },
    { id: 'videos', label: 'Video Library', icon: Video, count: videosCount },
    { id: 'documents', label: 'Documents', icon: FileText, count: docsCount },
    { id: 'audio', label: 'Audio Tracks', icon: Music, count: audioCount },
    { id: 'favorites', label: 'Starred', icon: Star, count: favoritesCount },
    { id: 'timeline', label: 'Timeline View', icon: Clock },
    { id: 'duplicates', label: 'Duplicate Cleaner', icon: Copy, count: duplicateGroups.length },
    { id: 'trash', label: 'Trash Quarantine', icon: Trash2, count: trashCount },
    { id: 'backup', label: 'Backup & Recovery', icon: ShieldAlert },
    { id: 'system', label: 'System & Security', icon: Server },
  ];

  const handleSelectTab = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    if (tabId === 'files') {
      // Keep or reset folder
    } else {
      setCurrentFolderId(null);
    }
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-40 lg:z-10 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-slate-50/95 dark:bg-slate-900/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header on Mobile */}
        <div className="flex items-center justify-between pb-3 lg:hidden border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            Navigation Menu
          </span>
          <button
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Storage
          </p>
          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive
                        ? 'bg-indigo-700/80 text-white'
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <p className="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Organize & Clean
          </p>
          {navItems.slice(5, 9).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive
                        ? 'bg-indigo-700/80 text-white'
                        : item.id === 'duplicates'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold'
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <p className="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Security & System
          </p>
          {navItems.slice(9).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Storage Quota & Zero-Knowledge Card */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Storage card */}
          <div className="p-3 bg-white dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                Storage Quota
              </span>
              <span className="font-medium text-slate-500 dark:text-slate-400">
                {storageBreakdown.usagePercentage}%
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, storageBreakdown.usagePercentage)}%` }}
              />
            </div>

            <div className="flex justify-between items-center mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{formatBytes(storageBreakdown.usedBytes)}</span>
              <span>of {formatBytes(storageBreakdown.totalBytes)}</span>
            </div>
          </div>

          {/* Zero-Knowledge Privacy status indicator */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px]">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <div className="overflow-hidden">
              <p className="font-semibold leading-tight">Zero-Knowledge Guard</p>
              <p className="text-[10px] text-emerald-800 dark:text-emerald-300 truncate">
                AES-GCM-256 Client-Side
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
