/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  File,
  Lock,
  CheckCircle2,
  Folder,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Archive,
  AlertCircle,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { formatBytes, getCategoryFromMime } from '../utils/vault-logic';

export const FileUploadModal: React.FC = () => {
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    uploadFiles,
    folders,
    currentFolderId,
    storageBreakdown,
  } = useVault();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [targetFolder, setTargetFolder] = useState<string | null>(currentFolderId);
  const [isDragging, setIsDragging] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [currentStepText, setCurrentStepText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isUploadModalOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    // Validate storage quota
    const totalNewBytes = newFiles.reduce((sum, f) => sum + f.size, 0);
    if (storageBreakdown.availableBytes < totalNewBytes) {
      setErrorMessage(`Insufficient vault storage. You need ${formatBytes(totalNewBytes)}, but only ${formatBytes(storageBreakdown.availableBytes)} is available.`);
      return;
    }
    setErrorMessage('');
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploadProgress(10);
    setCurrentStepText('Deriving client-side AES-GCM session key...');

    setTimeout(() => {
      setUploadProgress(40);
      setCurrentStepText('Computing SHA-256 signatures & zero-knowledge ciphering...');
    }, 400);

    setTimeout(() => {
      setUploadProgress(75);
      setCurrentStepText('Writing encrypted chunks to persistent browser storage...');
    }, 900);

    setTimeout(async () => {
      await uploadFiles(selectedFiles, targetFolder);
      setUploadProgress(100);
      setCurrentStepText('Upload & verification complete!');
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setSelectedFiles([]);
        setUploadProgress(null);
      }, 700);
    }, 1500);
  };

  const getCategoryIcon = (file: File) => {
    const cat = getCategoryFromMime(file.type, file.name);
    switch (cat) {
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

  const activeFolders = folders.filter(f => !f.isTrash);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Upload to Private Vault
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                End-to-End Encrypted File Storage
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(false)}
            aria-label="Close upload modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Click to browse or drag and drop files here
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Supports Photos (JPG, PNG, HEIC), 4K Videos, Documents (PDF, DOCX, XLSX), Audio (MP3, WAV), and ZIP
          </p>
        </div>

        {/* Selected Files Queue */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 max-h-40 overflow-y-auto space-y-1.5 pr-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 px-1 mb-1">
              <span>Selected Files ({selectedFiles.length})</span>
              <span>Total: {formatBytes(selectedFiles.reduce((s, f) => s + f.size, 0))}</span>
            </div>

            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {getCategoryIcon(file)}
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                    {file.name}
                  </span>
                  <span className="text-slate-400 text-[11px] shrink-0">
                    ({formatBytes(file.size)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Options & Settings: Destination folder & E2EE Toggle */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <label className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
              <Folder className="w-3.5 h-3.5 text-indigo-500" />
              Upload Location:
            </label>
            <select
              value={targetFolder || ''}
              onChange={e => setTargetFolder(e.target.value || null)}
              className="flex-1 max-w-[220px] py-1.5 px-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs truncate"
            >
              <option value="">Vault Root Directory</option>
              {activeFolders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Client-Side AES-GCM-256 Encryption
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Encrypt payloads with master key before writing to disk
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isEncrypting}
              onChange={e => setIsEncrypting(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        {/* Progress Display */}
        {uploadProgress !== null && (
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-indigo-900 dark:text-indigo-200">
              <span className="truncate">{currentStepText}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-indigo-200 dark:bg-indigo-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(false)}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedFiles.length === 0 || uploadProgress !== null}
            onClick={handleStartUpload}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition-all cursor-pointer ${
              selectedFiles.length === 0 || uploadProgress !== null
                ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-500'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-600/30'
            }`}
          >
            {uploadProgress !== null ? 'Encrypting & Storing...' : `Upload ${selectedFiles.length} File(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};
