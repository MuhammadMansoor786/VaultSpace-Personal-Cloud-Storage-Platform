/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Star,
  Trash2,
  Lock,
  History,
  Camera,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Play,
  Pause,
  Volume2,
  Maximize2,
  FileText,
  Calendar,
  HardDrive,
  Hash,
  ShieldCheck,
} from 'lucide-react';
import type { VaultFile } from '../types/vault';
import { formatBytes } from '../utils/vault-logic';
import { useVault } from '../context/VaultContext';

interface FilePreviewModalProps {
  file: VaultFile;
  onClose: () => void;
  onOpenVersions: (file: VaultFile) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  onOpenVersions,
}) => {
  const { toggleFavorite, trashFile, downloadFile } = useVault();

  // Photo controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Video controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Audio controls
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Details drawer toggle
  const [showDetails, setShowDetails] = useState(true);

  const handleDownload = () => {
    downloadFile(file);
  };

  const handleTogglePlayVideo = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleTogglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play();
      setIsAudioPlaying(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header Bar */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-sm text-white truncate max-w-md">
                {file.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <span>{file.encryptionAlgorithm}</span>
                <span>·</span>
                <span>{formatBytes(file.size)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!file.isTrash && (
              <button
                onClick={() => toggleFavorite(file.id)}
                aria-label={file.isFavorite ? 'Unfavorite' : 'Favorite'}
                className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
              >
                <Star className={`w-4 h-4 ${file.isFavorite ? 'text-amber-400 fill-current' : ''}`} />
              </button>
            )}

            <button
              onClick={() => onOpenVersions(file)}
              title="Version History"
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              title="Download Decrypted File"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {!file.isTrash && (
              <button
                onClick={() => {
                  trashFile(file.id);
                  onClose();
                }}
                title="Move to Trash"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <div className="w-px h-6 bg-slate-800 mx-1" />

            <button
              onClick={() => setShowDetails(p => !p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                showDetails
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Inspector
            </button>

            <button
              onClick={onClose}
              aria-label="Close Preview"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Visual Display */}
          <div className="flex-1 relative flex items-center justify-center bg-slate-950 p-6 overflow-hidden">
            {/* 1. Photo Preview with Zoom/Rotate */}
            {file.category === 'photo' && (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="flex-1 w-full flex items-center justify-center overflow-auto p-4">
                  <img
                    src={file.dataUrl || file.thumbnailUrl}
                    alt={file.name}
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease-out',
                    }}
                    className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-2xl select-none"
                  />
                </div>

                {/* Photo Toolbar */}
                <div className="absolute bottom-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2 flex items-center gap-3 text-xs shadow-xl">
                  <button
                    onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))}
                    className="p-1 hover:text-indigo-400"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-slate-400">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel(z => Math.min(3, z + 0.25))}
                    className="p-1 hover:text-indigo-400"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-slate-700" />
                  <button
                    onClick={() => setRotation(r => (r + 90) % 360)}
                    className="p-1 hover:text-indigo-400"
                    title="Rotate"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setZoomLevel(1);
                      setRotation(0);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* 2. Video Player with Speed & Theater Mode */}
            {file.category === 'video' && (
              <div className="w-full max-w-3xl flex flex-col items-center">
                <div className="w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 relative">
                  <video
                    ref={videoRef}
                    src={file.dataUrl}
                    controls
                    playsInline
                    className="w-full max-h-[60vh] object-contain"
                  />
                </div>

                {/* Video Extra Controls */}
                <div className="mt-4 flex items-center gap-3 text-xs bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Speed:</span>
                  {[0.5, 1, 1.25, 1.5, 2].map(rate => (
                    <button
                      key={rate}
                      onClick={() => handleChangePlaybackRate(rate)}
                      className={`px-2 py-0.5 rounded font-mono ${
                        playbackRate === rate
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Audio Player with Waveform Simulator */}
            {file.category === 'audio' && (
              <div className="w-full max-w-lg p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-2xl">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white mx-auto flex items-center justify-center mb-6 shadow-lg shadow-purple-600/20">
                  <Volume2 className="w-10 h-10" />
                </div>
                <h4 className="font-bold text-base text-white">{file.name}</h4>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {file.exifData?.duration || 'Audio Track'} · {formatBytes(file.size)}
                </p>

                {/* Simulated Audio Waveform Bars */}
                <div className="my-6 flex items-center justify-center gap-1 h-12">
                  {[24, 45, 60, 30, 80, 50, 95, 70, 40, 65, 85, 30, 75, 90, 50, 35, 60, 40].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ height: `${h}%`, opacity: 0.6 + (i % 3) * 0.2 }}
                    />
                  ))}
                </div>

                <audio ref={audioRef} src={file.dataUrl} controls className="w-full mt-2" />
              </div>
            )}

            {/* 4. Document / Archive / Other Preview */}
            {(file.category === 'document' || file.category === 'archive' || file.category === 'other') && (
              <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-base text-white">{file.name}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  MIME: {file.mimeType} · {formatBytes(file.size)}
                </p>
                <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left text-xs font-mono text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Zero-Knowledge Encrypted Payload</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    This file is stored in encrypted ciphertext blocks. Click the download button below to decrypt with your master key and save the original file.
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Decrypt & Download File
                </button>
              </div>
            )}
          </div>

          {/* Right Inspector Drawer (EXIF & Metadata) */}
          {showDetails && (
            <div className="w-80 border-l border-slate-800 bg-slate-900/90 p-6 overflow-y-auto shrink-0 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  File Details
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Filename</span>
                    <span className="font-semibold text-slate-200 break-words">{file.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Size</span>
                    <span className="font-mono text-slate-200">{formatBytes(file.size)} ({file.size.toLocaleString()} bytes)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Category</span>
                    <span className="text-slate-200 capitalize">{file.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Uploaded</span>
                    <span className="text-slate-200">{new Date(file.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* EXIF / Media details */}
              {file.exifData && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-400" />
                    Camera & Media EXIF
                  </h4>
                  <div className="space-y-2.5 text-xs font-mono">
                    {file.exifData.camera && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Equipment</span>
                        <span className="text-slate-300">{file.exifData.camera}</span>
                      </div>
                    )}
                    {file.exifData.dimensions && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Dimensions</span>
                        <span className="text-slate-300">{file.exifData.dimensions}</span>
                      </div>
                    )}
                    {file.exifData.resolution && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Resolution</span>
                        <span className="text-slate-300">{file.exifData.resolution}</span>
                      </div>
                    )}
                    {file.exifData.duration && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Duration</span>
                        <span className="text-slate-300">{file.exifData.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cryptography & Integrity */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-emerald-400" />
                  Cryptographic Integrity
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Algorithm</span>
                    <span className="font-mono text-emerald-400 font-semibold">{file.encryptionAlgorithm}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">SHA-256 Checksum</span>
                    <span className="font-mono text-[10px] text-slate-300 break-all bg-slate-950 p-1.5 rounded-lg border border-slate-800 block">
                      {file.checksum}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {file.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <span className="text-slate-500 block text-[11px] mb-2">Tags</span>
                  <div className="flex flex-wrap gap-1.5 text-xs text-slate-400">
                    {file.tags.map(t => (
                      <span key={t} className="font-mono text-[11px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
