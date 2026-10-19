/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FileCategory = 'photo' | 'video' | 'document' | 'audio' | 'archive' | 'other';

export interface FileVersion {
  id: string;
  versionNumber: number;
  size: number;
  uploadedAt: string;
  checksum: string;
  note?: string;
}

export interface VaultFile {
  id: string;
  userId: string;
  name: string;
  folderId: string | null; // null = root
  category: FileCategory;
  mimeType: string;
  size: number; // in bytes
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  isFavorite: boolean;
  isTrash: boolean;
  trashedAt?: string;
  checksum: string; // SHA-256
  isEncrypted: boolean;
  encryptionAlgorithm: string; // e.g. "AES-GCM-256"
  versions: FileVersion[];
  tags: string[];
  thumbnailUrl?: string;
  dataUrl?: string; // base64 or object URL for preview/download
  exifData?: {
    camera?: string;
    dimensions?: string;
    resolution?: string;
    duration?: string;
    bitrate?: string;
  };
}

export interface VaultFolder {
  id: string;
  userId: string;
  name: string;
  parentId: string | null; // null = root
  color: string;
  createdAt: string;
  updatedAt: string;
  isTrash: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  salt: string;
  passwordHash: string;
  recoveryPhrase: string; // 12-word mnemonic or master key
  createdAt: string;
  storageQuotaBytes: number; // e.g. 15 * 1024 * 1024 * 1024 (15GB)
  autoLogoutMinutes: number; // e.g. 30
  zeroKnowledgeEnabled: boolean;
  avatarSeed: string;
}

export interface StorageBreakdown {
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
  usagePercentage: number;
  photosBytes: number;
  videosBytes: number;
  documentsBytes: number;
  audioBytes: number;
  archivesBytes: number;
  otherBytes: number;
  filesCount: number;
  foldersCount: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: 'LOGIN' | 'FAILED_LOGIN' | 'LOGOUT' | 'UPLOAD' | 'DELETE' | 'RESTORE' | 'DOWNLOAD' | 'ENCRYPT' | 'BACKUP_EXPORT' | 'BACKUP_RESTORE' | 'INTEGRITY_CHECK';
  timestamp: string;
  details: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface BackupMetadata {
  id: string;
  createdAt: string;
  fileCount: number;
  totalSize: number;
  checksum: string;
  encryptedWithKey: boolean;
}

export type ViewMode = 'grid' | 'list';
export type SortField = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';
export type ActiveTab = 
  | 'files' 
  | 'photos' 
  | 'videos' 
  | 'documents' 
  | 'audio' 
  | 'favorites' 
  | 'timeline' 
  | 'duplicates' 
  | 'trash' 
  | 'backup' 
  | 'system';
