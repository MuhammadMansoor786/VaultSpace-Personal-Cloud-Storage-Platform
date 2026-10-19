/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  Calendar,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Clock,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { formatBytes } from '../utils/vault-logic';
import type { VaultFile } from '../types/vault';

export const TimelineView: React.FC = () => {
  const { files, setActivePreviewFile } = useVault();

  // Group active files chronologically by Year & Month
  const groupedTimeline = useMemo(() => {
    const nonTrash = files.filter(f => !f.isTrash);
    // Sort descending by date
    nonTrash.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const groups: { [key: string]: VaultFile[] } = {};

    for (const file of nonTrash) {
      const date = new Date(file.createdAt);
      const key = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(file);
    }

    return Object.entries(groups).map(([monthYear, items]) => ({
      monthYear,
      items,
    }));
  }, [files]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Vault Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse your photos, video recordings, documents, and media grouped by calendar memories.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Groups */}
      {groupedTimeline.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500">No memories recorded in timeline yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedTimeline.map(group => (
            <div key={group.monthYear} className="space-y-3">
              {/* Month Header Banner */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-extrabold">{group.monthYear}</span>
                <span className="text-slate-400 font-normal">({group.items.length} items)</span>
              </div>

              {/* Grid of items */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {group.items.map(file => (
                  <div
                    key={file.id}
                    onClick={() => setActivePreviewFile(file)}
                    className="group relative rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all cursor-pointer shadow-xs"
                  >
                    {file.thumbnailUrl || file.dataUrl ? (
                      <img
                        src={file.thumbnailUrl || file.dataUrl}
                        alt={file.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                        {file.category === 'video' ? (
                          <Video className="w-6 h-6 text-rose-500" />
                        ) : file.category === 'document' ? (
                          <FileText className="w-6 h-6 text-amber-500" />
                        ) : file.category === 'audio' ? (
                          <Music className="w-6 h-6 text-purple-500" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-blue-500" />
                        )}
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate w-full mt-1.5 px-1">
                          {file.name}
                        </p>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white text-[10px]">
                      <span className="font-semibold truncate">{file.name}</span>
                      <span className="text-slate-300 font-mono">{formatBytes(file.size)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
