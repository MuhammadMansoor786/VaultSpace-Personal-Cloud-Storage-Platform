/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Archive,
  File,
  Star,
  MoreVertical,
  Download,
  Trash2,
  Lock,
  History,
  Edit2,
  FolderInput,
  Check,
} from 'lucide-react';
import type { VaultFile } from '../types/vault';
import { formatBytes } from '../utils/vault-logic';
import { useVault } from '../context/VaultContext';

interface FileCardProps {
  file: VaultFile;
  isSelected: boolean;
  onSelect: () => void;
  onOpenPreview: () => void;
  onOpenVersions: () => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  isSelected,
  onSelect,
  onOpenPreview,
  onOpenVersions,
}) => {
  const {
    toggleFavorite,
    trashFile,
    restoreFile,
    deleteFilePermanently,
    downloadFile,
    renameFile,
  } = useVault();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);

  const getMediaThumbnail = () => {
    if (file.category === 'photo' && (file.thumbnailUrl || file.dataUrl)) {
      return (
        <img
          src={file.thumbnailUrl || file.dataUrl}
          alt={file.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      );
    }

    if (file.category === 'video' && file.thumbnailUrl) {
      return (
        <div className="relative w-full h-full">
          <img
            src={file.thumbnailUrl}
            alt={file.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md">
              <Video className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        </div>
      );
    }

    // Default icon fallback container
    let Icon = File;
    let iconColor = 'text-slate-400 bg-slate-100 dark:bg-slate-800';

    switch (file.category) {
      case 'document':
        Icon = FileText;
        iconColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/40';
        break;
      case 'audio':
        Icon = Music;
        iconColor = 'text-purple-500 bg-purple-50 dark:bg-purple-950/40';
        break;
      case 'archive':
        Icon = Archive;
        iconColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
        break;
      case 'video':
        Icon = Video;
        iconColor = 'text-rose-500 bg-rose-50 dark:bg-rose-950/40';
        break;
      case 'photo':
        Icon = ImageIcon;
        iconColor = 'text-blue-500 bg-blue-50 dark:bg-blue-950/40';
        break;
    }

    return (
      <div className={`w-full h-full flex items-center justify-center ${iconColor}`}>
        <Icon className="w-10 h-10" />
      </div>
    );
  };

  const handleSaveRename = () => {
    if (newName.trim() && newName !== file.name) {
      renameFile(file.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const dateFormatted = new Date(file.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onOpenPreview}
      className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-500/20 dark:ring-indigo-500/30'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top Media / Thumbnail Preview Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 select-none">
        {getMediaThumbnail()}

        {/* Selection Checkbox (Top Left) */}
        <div
          onClick={e => {
            e.stopPropagation();
            onSelect();
          }}
          className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 opacity-0 group-hover:opacity-100'
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>

        {/* Star / Favorite (Top Right) */}
        {!file.isTrash && (
          <button
            onClick={e => {
              e.stopPropagation();
              toggleFavorite(file.id);
            }}
            aria-label={file.isFavorite ? 'Unfavorite file' : 'Favorite file'}
            className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-all ${
              file.isFavorite
                ? 'bg-amber-400 text-amber-950 opacity-100'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-amber-500 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* E2EE Lock Icon Overlay */}
        {file.isEncrypted && (
          <div
            title="Encrypted with AES-GCM-256"
            className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/60 backdrop-blur-sm text-emerald-400 text-[10px] font-mono flex items-center gap-1"
          >
            <Lock className="w-2.5 h-2.5" />
            <span>E2EE</span>
          </div>
        )}

        {/* Multi-version badge */}
        {file.versions.length > 0 && (
          <div
            onClick={e => {
              e.stopPropagation();
              onOpenVersions();
            }}
            title="Version history available"
            className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/60 backdrop-blur-sm text-indigo-300 text-[10px] font-mono flex items-center gap-1 hover:text-white"
          >
            <History className="w-2.5 h-2.5" />
            <span>v{file.versions.length + 1}</span>
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          {isRenaming ? (
            <div onClick={e => e.stopPropagation()} className="flex items-center gap-1 w-full">
              <input
                type="text"
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveRename();
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
                className="w-full text-xs font-semibold py-1 px-1.5 bg-slate-100 dark:bg-slate-800 border border-indigo-500 rounded text-slate-900 dark:text-white"
              />
              <button
                onClick={handleSaveRename}
                className="text-xs text-indigo-600 font-bold px-1"
              >
                ✓
              </button>
            </div>
          ) : (
            <h5
              title={file.name}
              className="font-semibold text-xs text-slate-900 dark:text-white truncate"
            >
              {file.name}
            </h5>
          )}

          {/* Context Menu Trigger */}
          <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsMenuOpen(p => !p)}
              aria-label="File menu"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 bottom-6 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 text-xs font-medium animate-fadeIn"
              >
                {!file.isTrash ? (
                  <>
                    <button
                      onClick={() => {
                        downloadFile(file);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        setIsRenaming(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        onOpenVersions();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <History className="w-3.5 h-3.5" />
                      Version History
                    </button>
                    <button
                      onClick={() => {
                        trashFile(file.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Move to Trash
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        restoreFile(file.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      <FolderInput className="w-3.5 h-3.5" />
                      Restore File
                    </button>
                    <button
                      onClick={() => {
                        deleteFilePermanently(file.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Forever
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Clean Unboxed Metadata with Typographic Separator (Zero-Pill Compliance!) */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          <span>{formatBytes(file.size)}</span>
          <span aria-hidden="true">·</span>
          <span>{dateFormatted}</span>
        </div>
      </div>
    </div>
  );
};
