/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VaultFile, VaultFolder, StorageBreakdown, FileCategory, SortField, SortOrder } from '../types/vault';

/**
 * Format raw bytes into human readable binary units (B, KB, MB, GB, TB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm))} ${sizes[safeI]}`;
}

/**
 * Categorize a file by its mimeType or file extension
 */
export function getCategoryFromMime(mimeType: string, filename: string): FileCategory {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'heic', 'bmp', 'tiff'].includes(ext)) {
    return 'photo';
  }
  if (mimeType.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv'].includes(ext)) {
    return 'video';
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext)) {
    return 'audio';
  }
  if (
    mimeType.includes('pdf') ||
    mimeType.includes('word') ||
    mimeType.includes('sheet') ||
    mimeType.includes('presentation') ||
    mimeType.includes('document') ||
    mimeType.startsWith('text/') ||
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'csv', 'json', 'rtf'].includes(ext)
  ) {
    return 'document';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext) || mimeType.includes('zip') || mimeType.includes('compressed')) {
    return 'archive';
  }
  return 'other';
}

/**
 * Calculate accurate storage breakdown by category, quota, and total usage
 */
export function calculateStorageBreakdown(
  files: VaultFile[],
  folders: VaultFolder[],
  quotaBytes: number = 15 * 1024 * 1024 * 1024
): StorageBreakdown {
  const activeFiles = files.filter(f => !f.isTrash);
  const activeFolders = folders.filter(f => !f.isTrash);

  let photosBytes = 0;
  let videosBytes = 0;
  let documentsBytes = 0;
  let audioBytes = 0;
  let archivesBytes = 0;
  let otherBytes = 0;

  for (const file of activeFiles) {
    // Add file size + version sizes
    const versionsSize = file.versions.reduce((sum, v) => sum + v.size, 0);
    const totalFileSize = file.size + versionsSize;

    switch (file.category) {
      case 'photo':
        photosBytes += totalFileSize;
        break;
      case 'video':
        videosBytes += totalFileSize;
        break;
      case 'document':
        documentsBytes += totalFileSize;
        break;
      case 'audio':
        audioBytes += totalFileSize;
        break;
      case 'archive':
        archivesBytes += totalFileSize;
        break;
      default:
        otherBytes += totalFileSize;
        break;
    }
  }

  const usedBytes = photosBytes + videosBytes + documentsBytes + audioBytes + archivesBytes + otherBytes;
  const availableBytes = Math.max(0, quotaBytes - usedBytes);
  const usagePercentage = quotaBytes > 0 ? Math.min(100, Math.round((usedBytes / quotaBytes) * 1000) / 10) : 0;

  return {
    totalBytes: quotaBytes,
    usedBytes,
    availableBytes,
    usagePercentage,
    photosBytes,
    videosBytes,
    documentsBytes,
    audioBytes,
    archivesBytes,
    otherBytes,
    filesCount: activeFiles.length,
    foldersCount: activeFolders.length,
  };
}

/**
 * Detect duplicates across active files based on SHA-256 content checksums
 */
export function detectDuplicates(files: VaultFile[]): { checksum: string; files: VaultFile[]; wastedBytes: number }[] {
  const activeFiles = files.filter(f => !f.isTrash && f.checksum);
  const map = new Map<string, VaultFile[]>();

  for (const file of activeFiles) {
    const list = map.get(file.checksum) || [];
    list.push(file);
    map.set(file.checksum, list);
  }

  const duplicateGroups: { checksum: string; files: VaultFile[]; wastedBytes: number }[] = [];

  for (const [checksum, group] of map.entries()) {
    if (group.length > 1) {
      // Wasted bytes is size of (N - 1) copies
      const wastedBytes = group[0].size * (group.length - 1);
      duplicateGroups.push({
        checksum,
        files: group,
        wastedBytes,
      });
    }
  }

  return duplicateGroups.sort((a, b) => b.wastedBytes - a.wastedBytes);
}

/**
 * Filter and sort files based on user search, folder, category, and order
 */
export function filterAndSortFiles(
  files: VaultFile[],
  options: {
    search?: string;
    category?: FileCategory | 'all';
    folderId?: string | null;
    sortField: SortField;
    sortOrder: SortOrder;
    onlyFavorites?: boolean;
    onlyTrash?: boolean;
  }
): VaultFile[] {
  let result = files.filter(f => {
    // Trash filter
    if (options.onlyTrash) {
      if (!f.isTrash) return false;
    } else {
      if (f.isTrash) return false;
    }

    // Favorites filter
    if (options.onlyFavorites && !f.isFavorite) {
      return false;
    }

    // Folder filter (only applied when folderId is explicitly provided or we're in 'files' mode)
    if (options.folderId !== undefined) {
      if (f.folderId !== options.folderId) return false;
    }

    // Category filter
    if (options.category && options.category !== 'all') {
      if (f.category !== options.category) return false;
    }

    // Search query
    if (options.search && options.search.trim() !== '') {
      const q = options.search.toLowerCase().trim();
      const matchName = f.name.toLowerCase().includes(q);
      const matchTag = f.tags.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchTag) return false;
    }

    return true;
  });

  // Sorting
  result.sort((a, b) => {
    let cmp = 0;
    switch (options.sortField) {
      case 'name':
        cmp = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        break;
      case 'date':
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'size':
        cmp = a.size - b.size;
        break;
      case 'type':
        cmp = a.category.localeCompare(b.category);
        break;
    }
    return options.sortOrder === 'asc' ? cmp : -cmp;
  });

  return result;
}

/**
 * Resolve hierarchical breadcrumb list from root to current folder
 */
export function getFolderPath(
  folders: VaultFolder[],
  currentFolderId: string | null
): { id: string | null; name: string }[] {
  const path: { id: string | null; name: string }[] = [{ id: null, name: 'Vault Root' }];
  if (!currentFolderId) return path;

  const folderMap = new Map<string, VaultFolder>();
  folders.forEach(f => folderMap.set(f.id, f));

  const chain: { id: string; name: string }[] = [];
  let curr: VaultFolder | undefined = folderMap.get(currentFolderId);
  const visited = new Set<string>();

  while (curr && !visited.has(curr.id)) {
    visited.add(curr.id);
    chain.unshift({ id: curr.id, name: curr.name });
    curr = curr.parentId ? folderMap.get(curr.parentId) : undefined;
  }

  return [...path, ...chain];
}

/**
 * Calculate remaining days until trash auto-purge (e.g. 30 days retention)
 */
export function getDaysUntilPermanentDelete(trashedAt?: string, retentionDays: number = 30): number {
  if (!trashedAt) return retentionDays;
  const trashedDate = new Date(trashedAt).getTime();
  const now = Date.now();
  const elapsedDays = Math.floor((now - trashedDate) / (1000 * 60 * 60 * 24));
  return Math.max(0, retentionDays - elapsedDays);
}
